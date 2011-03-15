var http = require('http');

var page = '<html><head><title>gram.no.de</title></head><body><h1>gram.no.de</h1><p>Powered by <a href="http://nodejs.org/">nodejs.org</a></p></body></html>';

var server = http.createServer(function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write('<!DOCTYPE html>');
    response.end(page);
});

server.listen(process.env.PORT || 8080);
