var litmus = require('litmus'),
    Promise = require('../lib/a').Promise;

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

function increment(start, finish, delta) {
    var p = new Promise(),
        i, current = start;

    for(i = start; i < finish; i += delta) {
        setTimeout(function(){
            current += delta;
            if(current === finish) {
                p.resolve(current);
            } else if(current > finish) {
                p.reject(current);
            } else {
                p.progress(current);
            }
        }, i);
    }

    return p;
}

exports.test = new litmus.Test('Test promise handling', function() {

    this.plan(10);

    var test = this,
        successDesc = 'Promise resolved',
        failureDesc = 'Promise failed',
        successWithValueDesc = 'Promise resolved with value',
        failureWithValueDesc = 'Promise failed with value',
        progressDesc = 'Promise called progress handler',
        multiProgressDesc = 'Got expected number of progress reports',
        p;

        this.async('promise success', function(handle) {
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
        });

        this.async('promise fail', function(handle) {
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

        this.async('promise success with value', function(handle) {
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

        this.async('promise failure with value', function(handle) {
            var expected = 500;
            delay(101, expected).then(
                function() {
                    test.fail(failureWithValueDesc);
                    handle.resolve();
                },
                function(returnVal) {
                    test.is(returnVal, expected, failureWithValueDesc);
                    handle.resolve();
                }
            );
        });

        this.async('promise progress callback', function(handle) {
            var start = 0,
                finish = 100,
                expectedProgress = 50;
            
            increment(start, finish, 50).then(
                function() { },
                function() { },
                function(progressValue) {
                    test.is(progressValue, expectedProgress, progressDesc);
                    handle.resolve();
                }
            );
        });

        this.async('promise with multi progress callback', function(handle) {
            var start = 0,
                finish = 100,
                delta = 10,
                progressCount = 0;
            
            increment(start, finish, delta).then(
                function() {
                    test.is(progressCount, ((finish/delta)-1), multiProgressDesc);
                    handle.resolve();
                },
                function() { },
                function(progressValue) {
                    progressCount++;
                }
            );

        });

        p = new Promise();
        p.resolve();
        this.throwsOk(function() {
            p.resolve();
        }, /error/i, 'Promise can\'t be resolved more than once');
        this.throwsOk(function() {
            p.reject();
        }, /error/i, 'Can\'t reject promise once it\'s been resolved');
        this.throwsOk(function() {
            p.then();
        }, /error/i, 'Can\'t use promise once it\'s been resolved');

        this.async('promises can be chained', function(handle) {
            var input = 10,
                expected = input*2;

            delay(100, input)
            .then(function(result){
                return result*2;
            })
            .then(function(output){
                test.is(output, expected, 'Get the result of chained promise');
                handle.resolve();
            });
        });
});
