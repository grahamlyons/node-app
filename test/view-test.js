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

    this.plan(6);

    makeTemplateFile(filename, tmpl);
    makeTemplateFile(filenameData, tmplData);

    views.one = new View(filename);
    this.ok(views.one instanceof View, 'Can instantiate view');

    this.async('render template', function(handler) {
        var data = views.one.render();

        if(data.then) {
            data.then(function(view) {
                test.is(tmpl, view, 'Got expected text from promise');
                handler.resolve();
            });
        }
        else {
            test.is(tmpl, data, 'Got expected text, but not from promise');
            handler.resolve();
        }
    });

    views.two = new View(filename);
    this.async('render without promise', function(handler) {
        setTimeout(function() {
            test.is(tmpl, views.two.render(), 'Got expected text as return');
            handler.resolve();
        }, 1000); //Try to leave enough time to read the file
    });

    views.three = new View(filenameData, {name: 'gram'});
    this.async('pass data in constructor', function(handler) {
        var data = views.three.render();

        if(data.then) {
            data.then(function(view) {
                test.is('<h1>Hello gram</h1>', view, 'Got expected text with data replaced');
                handler.resolve();
            });
        }
        else {
            test.is('<h1>Hello gram</h1>', data, 'Got expected text with data replaced, but not from promise');
            handler.resolve();
        }

    });

    views.four = new View(filenameData);
    views.four.set('name', 'gram');
    this.async('set data with function on instance', function(handler) {
        var data = views.four.render();

        if(data.then) {
            data.then(function(view) {
                test.is('<h1>Hello gram</h1>', view, 'Got expected text with data set by function');
                handler.resolve();
            });
        }
        else {
            test.is('<h1>Hello gram</h1>', data, 'Got expected text with data set by function, but not from promise');
            handler.resolve();
        }
    });

    views.five = new View(filenameData);
    this.async('set data with function on instance', function(handler) {
        var data = views.five.render({name: 'gram'});

        if(data.then) {
            data.then(function(view) {
                test.is('<h1>Hello gram</h1>', view, 'Got expected text with data passed to render');
                handler.resolve();
            });
        }
        else {
            test.is('<h1>Hello gram</h1>', data, 'Got expected text with data passed to render, but not from promise');
            handler.resolve();
        }
    });

});
