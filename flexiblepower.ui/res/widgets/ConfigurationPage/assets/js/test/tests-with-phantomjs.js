phantom.create(function (ph) {
    ph.createPage(function (page) {
        page.open("http://localhost:8080/settings", function(response) {
            it("should give a succes message", function(response) {
                response.should.equal("success");
            });
            ph.exit();
        });
    })

    // page.open("http://www.google.com", function (status) {
    //     console.log("opened google? ", status);
    //     page.evaluate(function () { return document.title; }, function (result) {
    //         console.log('Page title is ' + result);
    //         ph.exit();
    //     });
    // });
});
