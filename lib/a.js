var Promise = function() {

    var pending = {
        success: [],
        failure: [],
        progress: []
    };

    this.then = function(success, failure, progress) {
        pending.success.push(success);
        pending.failure.push(failure);
    }

    this.resolve = function() {
        this.complete(pending.success);
    }

    this.reject = function() {
        this.complete(pending.failure);
    }

    this.complete = function(fnArray) {
        var fn;
        while(fn = fnArray.pop()) {
            fn.apply(this, arguments);
        }
        this.then = function(){throw new Exception('Promise has been resolved');};
    }

    this.progress = function() {
        var fn;
        for(fn in pending.progress) {
            fn.apply(this, arguments);
        }
    }

}

exports.Promise = Promise;
