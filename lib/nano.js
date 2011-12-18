var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    PORT = 8080;

function handleNotFound(request, response) {
    response.writeHead(404, {'Content-type': 'text/plain'});
    response.end('Not found');
}

function handleError(request, response) {
    response.writeHead(500, {'Content-type': 'text/plain'});
    response.end('Internal Error');
}

function handleSuccess(request, response, content) {
    response.writeHead(200, {'Content-type': 'text/html'});
    response.end(content);
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
                return route.handler(request, response);
            } catch(err) {
                console.log(err);
                handleError(request, response);
            }
        }
        if(route.path instanceof RegExp && (args = pathInfo.match(route.path))) {
            args.shift();
            args.unshift(request, response);
            return route.handler.apply(this, args);
        }
    }
    handleNotFound(request, response);
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
        headers = {};
        fs.readFile(root +'/'+ path, function(err, data) {
            if (err) {
                console.log(err);
                handleError(request, response);
            }
            headers['Content-type'] = types[type];
            headers['Content-length'] = data.length;
            response.writeHead(200, headers);
            response.end(data);
        });
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
        content = app.dispatch(request, response);
        if(content) {
            if(content.then) {
                content.then(
                    function(content){
                    handleSuccess(request, response, content);
                    },
                    function(err){
                        console.log(err);
                        handleError(request, response);
                    }
                );
            }
            else {
                handleSuccess(request, response, content);
            }
        }
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
