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
        "W": {
            ticks: 0,
            transX: -1,
            transY: 1
        },
        "WNW": {
            ticks: 1,
            transX: -1,
            transY: -1
        },
        "NW": 2,
        "NWN": 3,
        "N": 4,
        // "NEN": ,
        // "NE": ,
        // "ENE": ,
        // "E": ,
        // "ESE": ,
        // "SE": ,
        // "SES": ,
        // "S": ,
        // "SWS": ,
        // "SW": ,
        // "WSW":
    };

    // Degrees per angle.
    var degrees_per_angle = 22.5;

    $.fn.bounce_W = function (params) {
        var angle = angles["W"].ticks * degrees_per_angle;

        var options = $.extend({}, global_defaults, params);
            options.angle = angle;

        var translations = calc_distances(options.angle, options.distance);

        options.x = translations.a * angles["W"].transX;
        options.y = translations.b * angles["W"].transY;

        return this.each(function () {
            $(this).bounce(options);
        });
    };

    $.fn.bounce_WNW = function (params) {
        var angle = angles["WNW"].ticks * degrees_per_angle;

        var options = $.extend({}, global_defaults, params);
            options.angle = angle;

        var translations = calc_distances(options.angle, options.distance);

        options.x = translations.a * angles["WNW"].transX;
        options.y = translations.b * angles["WNW"].transY;

        return this.each(function () {
            $(this).bounce(options);
        });
    };

    $.fn.bounce_NW = function (params) {
        var angle = angles["NW"] * degrees_per_angle;

        var options = $.extend({}, global_defaults, params);
            options.angle = angle;

        var translations = calc_distances(options.angle, options.distance);

        options.x = translations.a;
        options.y = translations.b;

        return this.each(function () {
            $(this).bounce(options);
        });
    };

    $.fn.bounce_NWN = function (params) {
        var angle = angles["NWN"] * degrees_per_angle;

        var options = $.extend({}, global_defaults, params);
            options.angle = angle;

        var translations = calc_distances(options.angle, options.distance);

        options.x = translations.a;
        options.y = translations.b;

        return this.each(function () {
            $(this).bounce(options);
        });
    };

    $.fn.bounceOut = function (params) {
        var options = $.extend({}, global_defaults, params);

        var translations = calc_distances(options.angle, options.distance);
        options.x = translations.a;
        options.y = translations.b;

        return this.each(function () {
            $(this).animate({
                "left": "-=" + options.x,
                "top": "+=" + options.y
            }, options.duration);
        });
    };

    $.fn.bounceIn = function (params) {
        var options = $.extend({}, global_defaults, params);

        var translations = calc_distances(options.angle, options.distance);
        options.x = translations.a;
        options.y = translations.b;

        return this.each(function () {
            $(this).animate({
                "left": "+=" + options.x,
                "top": "-=" + options.y
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
        return length_c * Math.cos(Math.abs(alfa));
    }

    function calc_length_b (alfa, length_c) {
        return length_c * Math.sin(Math.abs(alfa));
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


