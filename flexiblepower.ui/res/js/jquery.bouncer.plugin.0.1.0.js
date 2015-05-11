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

    //

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
        return length_c * Math.cos(alfa);
    }

    function calc_length_b (alfa, length_c) {
        return length_c * Math.sin(alfa);
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


