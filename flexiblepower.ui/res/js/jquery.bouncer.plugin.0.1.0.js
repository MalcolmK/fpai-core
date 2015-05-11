(function ($) {
    // Overall defaults.
    var def_duration = 500;
    var global_defaults = {
        distance: 60,
        duration: 500,
        angle: 45,
        times: 25
    };

    var translations = calc_distances(global_defaults.angle, global_defaults.distance);
    global_defaults.x = translations.a;
    global_defaults.y = translations.b;

    // Angle counters.
    var angles = {
        // "W": {
        //     ticks: 0,
        //     transX: -1,
        //     transY: 1
        // },
        // "WNW": {
        //     ticks: 1,
        //     transX: -1,
        //     transY: -1
        // },
        // "NW": 2,
        // "NWN": 3,
        "N": {
            ticks: 4,
            quarter: "q2"
        },
        // "NEN": ,
        // "NE": ,
        // "ENE": ,
        "E": {
            ticks: 0,
            quarter: "q2"
        }
        // "ESE": ,
        // "SE": ,
        // "SES": ,
        // "S": ,
        // "SWS": ,
        // "SW": ,
        // "WSW":
    };

    // Quarters with the translations for the bounce OUT.
    var quarters = {
        "q1": {
            transX: "-1",
            transY: "-1"
        },
        "q2": {
            transX: "+1",
            transY: "-1"
        },
        "q3": {
            transX: "+1",
            transY: "+1"
        },
        "q4": {
            transX: "-1",
            transY: "+1"
        }
    };

    // Degrees per angle.
    var degrees_per_angle = 22.5;

    $.fn.bounce_N = function (params) {
        var options = $.extend({}, global_defaults, params);
            options.direction = "N";

        return this.each(function () {
            $(this).bounce(options);
        });
    };

    $.fn.bounce_E = function (params) {
        var options = $.extend({}, global_defaults, params);
            options.direction = "E";

        return this.each(function () {
            $(this).bounce(options);
        });
    };

    $.fn.bounceOut = function (params) {
        var options = $.extend({}, global_defaults, params);

        if (options.direction != false) {
            var angle = angles[options.direction].ticks * degrees_per_angle;

            options.angle = angle;
            options.quarter = angles[options.direction].quarter;
        }

        var translations = calc_distances(options.angle, options.distance);
        options.x = translations.a;
        options.y = translations.b;

        var signX = (quarters[options.quarter].transX == "-1" ? "-=" : "+=");
        var signY = (quarters[options.quarter].transY == "-1" ? "-=" : "+=");

        return this.each(function () {
            $(this).animate({
                "left": signX + options.x,
                "top": signY + options.y
            }, options.duration);
        });
    };

    $.fn.bounceIn = function (params) {
        var options = $.extend({}, global_defaults, params);

        if (options.direction != false) {
            var angle = angles[options.direction].ticks * degrees_per_angle;

            options.angle = angle;
            options.quarter = angles[options.direction].quarter;
        }

        var translations = calc_distances(options.angle, options.distance);
        options.x = translations.a;
        options.y = translations.b;

        var signX = (quarters[options.quarter].transX == "-1" ? "+=" : "-=");
        var signY = (quarters[options.quarter].transY == "-1" ? "+=" : "-=");

        return this.each(function () {
            $(this).animate({
                "left": signX + options.x,
                "top": signY + options.y
            }, options.duration);
        });
    };

    $.fn.bounce = function (params) {
        var options = $.extend({}, global_defaults, params);

        return this.each(function () {
            for (var i = 0; i < options.times; i += 1) {
                $(this).bounceOut(options).bounceIn(options);
            }
        });
    };

    // Helper functions.
    function calc_distances (alfa, length_c) {
        return {
            a: calc_length_a(alfa, length_c),
            b: calc_length_b(alfa, length_c),
            c: length_c,
            alfa: alfa
        };
    }

    function calc_length_a (alfa, length_c) {
        var radians = alfa * (Math.PI/180);
        return length_c * Math.cos(Math.abs(radians));
    }

    function calc_length_b (alfa, length_c) {
        var radians = alfa * (Math.PI/180);
        return length_c * Math.sin(Math.abs(radians));
    }
}(jQuery));






// function bounceAway (element, x, y) {
//     return $(element).animate({
//         "left": "-=" + x,
//         "top": "+=" + y
//     }, 500);
// }


// function bounceIn (element, x, y) {
//     return $(element).animate({
//         "left": "+=" + x,
//         "top": "-=" + y
//     }, 500);
// }


// arrow.css(
//     "left",
//     (
//         newAppsButton.offset().left -
//         (
//             ($(newAppsButton).outerWidth(true) * 2)
//         )
//     )
// );


