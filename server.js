var nano = require('./lib/nano'),
    page = '<html><head><title>gram.no.de</title></head><body><h1>gram.no.de</h1><p>Powered by <a href="http://nodejs.org/">nodejs.org</a></p></body></html>',
    app = nano.app;

app.get('/', function(request, response) {
    response.writeHead(200, {'Content-type': 'text/html'});
    response.write('<!DOCTYPE HTML>');
    response.end(page);
});

nano.start();
