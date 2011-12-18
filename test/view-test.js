var litmus = require('litmus'),
    View = require('../lib/view'),
    fs = require('fs');

function makeTemplateFile(file, content) {
    fs.writeFileSync(file, content);
}

exports.test = new litmus.Test('Testing the view', function() {

    var test = this,
        tmpl = '<h1>Hello</h1>',
        filename = __dirname + '/test.html',
        tmplData = '<h1>Hello <%=name%></h1>',
        filenameData = __dirname + '/test.jhtml',
        views = {};

    makeTemplateFile(filename, tmpl);

    views.one = new View(filename);
    this.ok(views.one instanceof View, 'Can instantiate view');

    this.async('render template', function(handler) {
        views.one.render().then(
            function(view) {
                test.is(tmpl, view, 'Got expected text');
                handler.resolve();
            }
        );
    });

    views.two = new View(filename);
    this.async('render without promise', function(handler) {
        setTimeout(function() {
            test.is(tmpl, views.two.render(), 'Got expected text as return');
            handler.resolve();
        }, 1000); //Try to leave enough time to read the file
    });

    makeTemplateFile(filenameData, tmplData);
    views.three = new View(filenameData, {name: 'gram'});
    this.async('pass data in constructor', function(handler) {
        views.three.render().then(
            function(view) {
                test.is('<h1>Hello gram</h1>', view, 'Got expected text with data replaced');
                handler.resolve();
            }
        );
    });

});
