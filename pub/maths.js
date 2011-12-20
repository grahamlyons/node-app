define(function () {

    return {
        /**
         * Returns the factorial of an integer
         */
        factorial : function(x) {
            var fact = 1;
            if (x < 0) { return Number.NaN; }
            if (x !== parseInt(x)) { throw new Error("Unsupported operation"); }
            for(; x > 0; x--){
                fact = fact * x;
            }
            return fact;
        },
        
        /**
         * Returns the binomial coefficient of two numbers
         */
        binomialCoefficient : function(n, i) {
            var num, den, result;
            num = this.factorial(n);
            den = this.factorial(i) * this.factorial(n-i);
            result = num/den;
            return isNaN(result) ? 0 : result;
        }
    }

});
