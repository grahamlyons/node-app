var Promise = function() {

    var pending = {
        success: [],
        failure: [],
        progress: []
    };

    this.then = function(success, failure, progress) {
        pending.success.push(success);
        pending.failure.push(failure);
        pending.progress.push(progress);
    }

    this.resolve = function(arg) {
        this.complete(pending.success, arg);
    }

    this.reject = function(arg) {
        this.complete(pending.failure, arg);
    }

    this.complete = function(fnArray, fnArg) {
        var fn;
        while(fn = fnArray.pop()) {
            fn(fnArg);
        }
        this.then = function(){throw new Exception('Promise has been resolved');};
    }

    this.progress = function(arg) {
        var index,
            fns = pending.progress;
        for(index in fns) {
            fns[index](arg);
        }
    }

}

exports.Promise = Promise;
