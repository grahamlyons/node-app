var litmus = require('litmus'),
    Promise = require('../lib/a').Promise;

exports.test = new litmus.Test('Test promise handling', function() {

    function delay(t, value) {
        var p = new Promise();

        setTimeout(function(){
            if(t%2 === 0) {
                p.resolve(value);
            } else {
                p.reject(value);
            }
        },t);
        
        return p;
    }

    this.plan(3);

    var test = this,
        successDesc = 'Promise resolved',
        failureDesc = 'Promise failed',
        successWithValueDesc = 'Promise resolved with value',
        failureWithValueDesc = 'Promise failed with value',
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
        }),
        handleSuccessWithValue = this.async('promise success with value', function(handle) {
            var expected = 200;
            delay(100, expected).then(
                function(returnVal) {
                    test.is(returnVal, expected, successWithValueDesc);
                    handle.resolve();
                },
                function() {
                    test.fail(successWithValueDesc);
                    handle.resolve();
                }
            );
        });

});
