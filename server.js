var nano = require('./lib/nano'),
    View = require('./lib/view'),
    app = nano.app;

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

nano.start();
