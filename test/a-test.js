var litmus = require('litmus'),
    Promise = require('../lib/a').Promise;

exports.test = new litmus.Test('Test promise handling', function() {

    function delay(t) {
        var p = new Promise();

        setTimeout(function() {
            if(t%2 === 0) {
                p.resolve();
            } else {
                p.reject();
            }
        },t);
        
        return p;
    }

    this.plan(2);

    var test = this,
        successDesc = 'Promise resolved',
        failureDesc = 'Promise failed',
        handleSuccess = this.async('promise success', function(handle) {
            delay(100).then(
                function() {
                    test.pass(successDesc);
                    handle.resolve();
                },
                function() {
                    test.fail(successDesc);
                    handle.resolve();
                }
            );
        }),
        handleFailure = this.async('promise fail', function(handle) {
            delay(101).then(
                function() {
                    test.fail(failureDesc);
                    handle.resolve();
                },
                function() {
                    test.pass(failureDesc);
                    handle.resolve();
                }
            );
        });

});
