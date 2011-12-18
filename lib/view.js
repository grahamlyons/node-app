var _ = require('underscore'),
    fs = require('fs'),
    a = require('./a'),
    Emitter = require('events').EventEmitter
    eventName = 'template';
 
module.exports = View;

function View(template, data) {

    var self = this;
    this.compiledTemplate;
    this.viewData = {};
    this.event = new Emitter();

    _.extend(this.viewData, data);
    fs.readFile(template, function(err, contents) {
        if(err) {
            console.log(err);
        }
        else {
            self.compiledTemplate = _.template(contents.toString());
            self.event.emit(eventName);
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
        self.event.on(eventName, function(){
            promise.resolve(self.compiledTemplate(self.viewData));
        });
        return promise;
    }
}
