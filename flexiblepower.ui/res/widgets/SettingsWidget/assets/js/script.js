$(window).load(function() {
    w = new widget("update", 1000, function(data) {
        console.log(data);
    });
});