var nano = require('./lib/nano'),
    View = require('./lib/view'),
    app = nano.app,
    options = {};

app.get('/', function(request, response) {
    var view = new View('./views/index.html');
    view.then(function(view){
        response.writeHead(200, {'Content-type': 'text/html'});
        response.end(view.render());
    },
    function(){
        nano.handleError(request, response);
    });
});

options.PORT = process.env.PORT || 8080;

nano.start(options);
