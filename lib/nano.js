var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    a = require('./a'),
    files = require('./files'),
    md5Hash = files.md5Hash,
    getFile = files.getFile,
    PORT = 8080;

/**
 * Sets the response to be a 404
 * @param request
 * @param response
 * @return Response
 */
function handleNotFound(request, response) {
    response.status = 404;
    response.contentType = "text/plain";
    response.setBody('Not found');
    return response;
}

/**
 * Sets the response to be a 500
 * @param request
 * @param response
 * @return Response
 */
function handleError(request, response) {
    response.status = 500;
    response.contentType = "text/plain";
    response.setBody('Internal Error');
    return response;
}

/**
 * Sends the response, adding etag and content length headers.
 * @param request
 * @return void
 */
function sendResponse(request) {
    var hash = '"'+md5Hash(this.body)+'"';

    this.setHeader('Content-length', Buffer.byteLength(this.body.toString()));

    this.setHeader('Etag', hash);
    if(request && request.headers['if-none-match'] === hash) {
        this.status = 304;
        this.body = undefined;
    }
    if(request.method.toUpperCase() === 'HEAD') {
        this.body = undefined;
    }
    this._response.writeHead(this.status, this.headers);
    this._response.end(this.body);
}

/**
 * Constructor for the nano response object
 * @param http.ServerResponse response
 */
var Response = function(response) {
    this._response = response;
    this.body;
    this.status = 200;
    this.headers = {'Content-Type': 'text/html'};
}

/**
 * Given a header name and a value, sets it to send later
 * @param string header
 * @param string|number value
 * @return Response
 */
Response.prototype.setHeader = function(header, value) {
    this.headers[header] = value;
    return this;
}

/**
 * Sets the content type of the response
 * @param string type
 * @return Response
 */
Response.prototype.setContentType = function(type) {
    this.headers['Content-Type'] = type;
    return this;
}

/**
 * Sets the body of the response
 * @param string content
 * @return Response
 */
Response.prototype.setBody = function(content) {
    this.body = content;
    return this;
}

/**
 * Sends the response
 * @param http.ServerRequest request
 * @return void
 */
Response.prototype.send = function(request) {
    var self = this;
    if(this.body && this.body.then) {
        try{
            this.body.then(function(body) {
                self.body = body;
                sendResponse.call(self, request);
            },
            function(err) {
                console.log(err); 
            });
        }
        catch(e) {
            console.log(e);
            self = handleError(request, self);
            sendResponse.call(self, request);
        }
    }
    else {
        sendResponse.call(this, request);
    }
}

/**
 * Constructor for nano app
 * @return App
 */
var App = function() {

    this.routes = {
        'GET':[],
        'HEAD':[],
        'POST':[],
        'PUT':[],
        'DELETE':[]
    };    

}

// TODO support named parameters
function createRegexPath(path) {

    var parts = path.split(':');

}

/**
 * Adds a route to the application
 * @param string method
 * @param string|regex path
 * @param function handler
 * @return void
 */
App.prototype.addRoute = function(method, path, handler) {

    this.routes[method].push({path: path, handler: handler});

}

/**
 * Handles the incoming request 
 * @param http.ServerRequest request
 * @param Response response
 * @return string|Promise
 */
App.prototype.dispatch = function(request, response) {

    var methodRoutes = this.routes[request.method.toUpperCase()],
    i,
    route,
    pathInfo = url.parse(request.url).pathname,
    content;

    for(i in methodRoutes) {
        route = methodRoutes[i];
        if(route.path == pathInfo) {
            try{
                response.setBody(route.handler(request, response));
                return response;
            } catch(err) {
                console.log(err);
                return handleError(request, response);
            }
        }
        if(route.path instanceof RegExp && (args = pathInfo.match(route.path))) {
            args.shift();
            args.unshift(request, response);
            response.setBody(route.handler.apply(this, args));
            return response;
        }
    }
    return handleNotFound(request, response);
}

/**
 * Adds a route responding to GET and HEAD requests
 * @param string|regex path
 * @param function handler
 * @return void
 */
App.prototype.get = function(path, handler) { 
    this.addRoute('GET', path, handler);
    this.addRoute('HEAD', path, handler);
}

/**
 * Adds a route responding to POST requests
 * @param string|regex path
 * @param function handler
 * @return void
 */
App.prototype.post = function(path, handler) { 
    this.addRoute('POST', path, handler);
}

/**
 * Adds a route responding to PUT requests
 * @param string|regex path
 * @param function handler
 * @return void
 */
App.prototype.put = function(path, handler) { 
    this.addRoute('PUT', path, handler);
}

/**
 * Adds a route responding to DELETE requests
 * @param string|regex path
 * @param function handler
 * @return void
 */
App.prototype.del = function(path, handler) { 
    this.addRoute('DELETE', path, handler);
}

/**
 * Adds a route to serve static content from a directory on disk
 * @param string prefix The URL prefix to respond to requests for static content
 * @param string root The directory root on disk
 * @return void
 */
App.prototype.addStaticRoute = function(prefix, root) {

    this.get(new RegExp('^' + prefix + '(.+\.(js|css|html))'), function(request, response, path, type) {
        var types = {
            'js': 'text/javascript',
            'css': 'text/css',
            'html': 'text/html'
        },
        promise = new a.Promise(),
        filepath = root +'/'+ path,
        hash = md5Hash(filepath);

        response.setContentType(types[type]);
        getFile(filepath, function(err, data) {
            if (err) {
                console.log(err);
                promise.reject();
            }
            else {
                promise.resolve(data);
            }
        });

        return promise;
    });

}

var app = exports.app = new App();

/**
 * Start the application
 * @param object options
 * @return void
 */
exports.start = function(options) {
    var port = (options && options.PORT) ? options.PORT : PORT,
    ip, server, logmsg, content;

    if(options && options.IP) {
        ip = options.IP;
    }

    server = http.createServer(function(request, response) {
        response = app.dispatch(request, new Response(response));
        response.send(request);
    })

    logmsg = 'Listening on ';
    if(ip) {
        server.listen(port, ip);
        logmsg += ip+':';
    } else {
        server.listen(port);
    }
    console.info(logmsg + port);
}

exports.App = App;

exports.Response = Response;
