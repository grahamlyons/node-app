var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    a = require('./a'),
    PORT = 8080;

function handleNotFound(request, response) {
    response.status = 404;
    response.contentType = "text/plain";
    response.setBody('Not found');
    return response;
}

function handleError(request, response) {
    response.status = 500;
    response.contentType = "text/plain";
    response.setBody('Internal Error');
}

var Response = function(response) {
    this._response = response;
    this.body;
    this.status = 200;
    this.headers = {'Content-Type': 'text/html'};
}

Response.prototype.setContentType = function(type) {
    this.headers['Content-Type'] = type;
    return this;
}

Response.prototype.setBody = function(content) {
    this.body = content;
    return this;
}

Response.prototype.send = function() {
    var self = this;
    this._response.writeHead(this.status, this.headers);
    if(this.body && this.body.then) {
        this.body.then(function(body) {
            self._response.end(body);
        },
        function(err) {
            console.log(err); 
        });
    }
    else {
        this._response.end(this.body);
    }
}

var App = function() {

    this.routes = {
        'GET':[],
        'HEAD':[],
        'POST':[],
        'PUT':[],
        'DEL':[]
    };    

}

// TODO support named parameters
function createRegexPath(path) {

    var parts = path.split(':');

}

App.prototype.addRoute = function(method, path, handler) {

    this.routes[method].push({path: path, handler: handler});

}

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

App.prototype.get = function(path, handler) { 
    this.addRoute('GET', path, handler);
    this.addRoute('HEAD', path, handler);
}

App.prototype.post = function(path, handler) { 
    this.addRoute('POST', path, handler);
}

App.prototype.put = function(path, handler) { 
    this.addRoute('PUT', path, handler);
}

App.prototype.del = function(path, handler) { 
    this.addRoute('DEL', path, handler);
}

App.prototype.addStaticRoute = function(prefix, root) {

    this.get(new RegExp('^' + prefix + '(.+\.(js|css|html))'), function(request, response, path, type) {
        var types = {
            'js': 'text/javascript',
            'css': 'text/css',
            'html': 'text/html'
        },
        headers = {},
        promise = new a.Promise();

        response.setContentType(types[type]);
        fs.readFile(root +'/'+ path, function(err, data) {
            if (err) {
                console.log(err);
                handleError(request, response)
                promise.resolve();
            }
            else {
                //response.setHeader('Content-length', data.length);
                promise.resolve(data);
            }
        });
        return promise;
    });

}

var app = exports.app = new App();

exports.start = function(options) {
    var port = (options && options.PORT) ? options.PORT : PORT,
    ip, server, logmsg, content;

    if(options && options.IP) {
        ip = options.IP;
    }

    server = http.createServer(function(request, response) {
        response = app.dispatch(request, new Response(response));
        if(request.method.toUpperCase() === 'HEAD') {
            response.body = undefined;
        }
        response.send();
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
