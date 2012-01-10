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

    function testWithPossiblePromise(expected, obtained, message, handler) {
        if(obtained.then) {
            obtained.then(function(view) {
                test.is(expected, view, message);
                handler.resolve();
            });
        }
        else {
            test.is(expected, obtained, message + ', but not from promise');
            handler.resolve();
        }
    }

    views.one = new View(filename);
    this.ok(views.one instanceof View, 'Can instantiate view');

    this.async('render template', function(handler) {
        var data = views.one.render();

        testWithPossiblePromise(
            tmpl, 
            data, 
            'Got expected text from promise', 
            handler); 
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

        testWithPossiblePromise(
            '<h1>Hello gram</h1>', 
            data, 
            'Got expected text with data replaced', 
            handler); 

    });

    views.four = new View(filenameData);
    views.four.set('name', 'gram');
    this.async('set data with function on instance', function(handler) {
        var data = views.four.render();

        testWithPossiblePromise(
            '<h1>Hello gram</h1>', 
            data, 
            'Got expected text with data set by function', 
            handler); 
    });

    views.five = new View(filenameData);
    this.async('pass data into render function', function(handler) {
        var data = views.five.render({name: 'gram'});

        testWithPossiblePromise(
            '<h1>Hello gram</h1>', 
            data, 
            'Got expected text with data passed to render', 
            handler); 
    });

    this.finished.then(function(){
        fs.unlinkSync(filename);
        fs.unlinkSync(filenameData);
    });

});
