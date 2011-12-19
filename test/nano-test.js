var litmus = require('litmus'),
    nano = require('../lib/nano');

function mockRequest(method, url) {
    return {
        method: method.toUpperCase(),
        url: url
    };
}

exports.test = new litmus.Test('Test nano framework', function() {

    var app = nano.app
        test = this;

    this.ok(app instanceof nano.App, 'nano.app is instance of the App object');
    this.ok(app.get, 'app has get handler');
    this.ok(app.post, 'app has post handler');
    this.ok(app.put, 'app has put handler');
    this.ok(app.del, 'app has del handler');

    app.get('/', function(request, response) {
        return 'Hello';
    });

    this.is(
        app.dispatch(mockRequest('GET', '/'), {}), 
        'Hello', 
        'Matched route returns content define by function');

    this.is(
        app.dispatch(mockRequest('HEAD', '/'), {}), 
        'Hello', 
        'Route defined for get is also served for head request');

    app.dispatch(
        mockRequest('GET', '/notmatched'), 
        {writeHead:function(statusCode, headers) {
            test.is(
                statusCode,
                404, 
                'Unmatched route gives not found');
        }, end:function() {}});
});
