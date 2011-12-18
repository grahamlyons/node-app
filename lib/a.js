/**
 * Simple implementation of Promise spec A:
 *  http://wiki.commonjs.org/wiki/Promises/A
 */

/**
 * Constructor
 */
var Promise = function() {

    this.pending = {
        success: [],
        failure: [],
        progress: []
    };

    this.complete = function(fnArray, fnArg) {
        var fn;
        while(fn = fnArray.pop()) {
            fn(fnArg);
        }
        this.then = this.resolve = this.reject = function(){throw new Error('Promise has been resolved');};
    }

}

/**
 * Define callbacks to run when the promise is completed.
 * @param function success
 * @param function failure
 * @param function progress
 */
Promise.prototype.then = function(success, failure, progress) {
    this.pending.success.push(success);
    this.pending.failure.push(failure);
    this.pending.progress.push(progress);
}

/**
 * Resolve promise.
 * @param mixed arg
 */
Promise.prototype.resolve = function(arg) {
    this.complete(this.pending.success, arg);
}

/**
 * Reject promise.
 * @param mixed arg
 */
Promise.prototype.reject = function(arg) {
    this.complete(this.pending.failure, arg);
}

/**
 * Get progress on promise.
 * @param mixed arg
 */
Promise.prototype.progress = function(arg) {
    var index,
        fns = this.pending.progress;
    for(index in fns) {
        fns[index](arg);
    }
}

exports.Promise = Promise;
