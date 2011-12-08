var _ = require('underscore'),
    fs = require('fs'),
    a = require('./a');
 
module.exports = View;

function View(template, data) {

    this.compiledTemplate;
    this.viewData = {};
    var self = this;

    _.extend(this.viewData, data);
    var promise = new a.Promise();
    fs.readFile(template, function(err, contents) {
        if(err) {
            console.log(err);
            promise.reject();
        }
        else {
            self.compiledTemplate = _.template(contents.toString());
            promise.resolve(self);
        }
    });

    return promise;
}

View.prototype.set = function(key, value) {
    this.viewData[key] = value;
    return this;
}

View.prototype.render = function(data) {
    _.extend(this.viewData, data);
    return this.compiledTemplate(this.viewData);
}
