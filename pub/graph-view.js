define(['jquery'], function ($) {

    var point = '<span class="point">&nbsp;</span>',
        mark = '<span class="point mark">&nbsp;</span>',
        $graph = $('#draw');

    function addMarkers (markers) {
        var numMarks = markers.length;
        for (var i = 0; i < numMarks; i++) {
            var $mark = $(mark).css({left:markers[i][0], bottom:markers[i][1]});
            $graph.append($mark);
        }
    }

    return {
        render : function () {
            var num = this.coords.length,
                i,
                $point;

            for (i = 0; i < num; i++) {
                $point = $(point).css({left:this.coords[i][0], bottom:this.coords[i][1]});
                $graph.append($point);
            }

            if (this.markers && this.markers.length) {
                addMarkers(this.markers);
            }
        }
    }

});
