var _ = require('underscore'),
    fs = require('fs'),
    a = require('./a'),
    Emitter = require('events').EventEmitter;
 
module.exports = View;

var event = new Emitter();

function View(template, data) {

    var self = this;
    this.compiledTemplate;
    this.viewData = {};

    _.extend(this.viewData, data);
    fs.readFile(template, function(err, contents) {
        if(err) {
            console.log(err);
        }
        else {
            self.compiledTemplate = _.template(contents.toString());
            event.emit('template', self.compiledTemplate);
        }
    });

    return this;
}

View.prototype.set = function(key, value) {
    this.viewData[key] = value;
    return this;
}

View.prototype.render = function(data) {
    var self = this;
    _.extend(this.viewData, data);
    if(this.compiledTemplate) {
        return this.compiledTemplate(this.viewData);
    }
    else {
        var promise = new a.Promise();
        event.on('template', function(compiledTemplate){
            promise.resolve(compiledTemplate(self.viewData));
        });
        return promise;
    }
}
