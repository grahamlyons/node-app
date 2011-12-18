var _ = require('underscore'),
    fs = require('fs'),
    a = require('./a'),
    Emitter = require('events').EventEmitter
    eventName = 'template';
 
module.exports = View;

/**
 * Constructor. Takes the path to a template and optionally data.
 * @param string template
 * @param object data
 * @return View
 */
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

/**
 * Set data on the view
 * @param string key
 * @param mixed value
 * @return View
 */
View.prototype.set = function(key, value) {
    this.viewData[key] = value;
    return this;
}

/**
 * Render the template.
 * @param object data
 * @return string|promise
 */
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
