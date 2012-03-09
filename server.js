var nada = require('nada'),
    View = nada.View,
    app = nada.app,
    options = {};

app.get('/', function(request, response) {
    var view = new View('./views/index.html');
    return view.render();
});

app.addStaticRoute('/static', __dirname + '/pub');

options.PORT = process.env.PORT || 8080;

nano.start(options);
