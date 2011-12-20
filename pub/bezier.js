define(['maths'], function (maths) {

    var points = [], 
        dimensions, 
        numberOfPoints;


    var getDimensions = function () {
         if (!dimensions){
              dimensions = points.length;
         }
         return dimensions;
    };

    var getNumberOfPoints = function () {
         if (!numberOfPoints){
              numberOfPoints = points[0].length-1 ;
         }
         return numberOfPoints ;
    }; 

    return {
        /**
         * Add a point to the bezier curve
         * @param Array coords
         */
        addPoint : function (coords) {
            var i;
            if (points.length == 0) {
               for(i=0; i<coords.length; i++) {
                    points[i] = [];
                } 
            }
            for(i=0; i<coords.length; i++) {
                points[i].push(coords[i]);
            }
        },

        /**
         * Return the points of the bezier curve
         */
        getPoints : function () {
            var p = [],
                num = getNumberOfPoints(),
                dim = getDimensions(),
                i,
                d;
            
            for (i=0; i <= num; i++) {
                var co = [];
                for (d=0; d < dim; d++) {
                    co.push(points[d][i]);
                }
                p.push(co);
            }
            return p;
        },

        /**
         * Return the coordinates of a point on the curve for a value of t between 0 and 1
         */
        getCoords : function (t) {
            var n = getNumberOfPoints(), 
                dim = getDimensions(),
                coords = [],
                d,
                i;
            for(d=0; d<dim; d++) {
                coords[d] = 0;
                for(i=0; i<=n; i++) {
                    coords[d] 
                        += maths.binomialCoefficient(n, i) 
                        * Math.pow((1-t), (n-i)) 
                        * Math.pow(t, i) 
                        * points[d][i];
                }
            }
            return coords;
        }
    };

});
