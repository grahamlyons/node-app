var litmus = require('litmus'),
    nano = require('../lib/nano');

function mockRequest(method, url) {
    return {
        method: method.toUpperCase(),
        url: url
    };
}

exports.test = new litmus.Test('Test nano framework', function() {

    var response = new nano.Response();

    this.ok(response.setBody, 'Response has setBody method');

    this.async('test basic app instantiation', function(handler) {

        var app = nano.app
        test = this;

        this.ok(app instanceof nano.App, 'nano.app is instance of the App object');
        this.ok(app.get, 'app has get handler');
        this.ok(app.post, 'app has post handler');
        this.ok(app.put, 'app has put handler');
        this.ok(app.del, 'app has del handler');

        handler.resolve();
    });

    this.async('test simple route', function(handler) {
        var app = nano.app,
            test = this,
            response;

        app.get('/', function(request, response) {
            test.ok(request, 'Callback handler gets passed request');
            test.ok(response, 'Callback handler gets passed response');
            return 'Hello';
        });

        response = app.dispatch(mockRequest('GET', '/'), new nano.Response());

        this.is(
            response.body,
            'Hello', 
            'Matched route returns content define by function');

        this.is(
            response.status,
            200, 
            'Matched route returns 200 status');

        response = app.dispatch(mockRequest('HEAD', '/'), new nano.Response()), 

        this.is(
            response.status,
            200, 
            'Route defined for get is also served for head request');

        response = app.dispatch(mockRequest('GET', '/notmatched'), new nano.Response()), 
        this.is(
            response.body,
            'Not found', 
            'Unmatched route gives not found message in body'
        );
        this.is(
            response.status,
            404, 
            'Unmatched route gives 404 not found status'
        );

        handler.resolve();
    });
});
