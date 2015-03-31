// var fs = require('fs');
// var vm = require('vm');
// var jsdom = require('jsdom');
var should = require('should');
// var path = "./script.js";
// var path = "./../script.js";

// var code = fs.readFileSync(path);
// vm.runInThisContext(code);

// var sourceFile = require('./../test-file');

describe("Testing the browser:", function() {

    const Browser = require('zombie');

    Browser.localhost('localhost', 8080);

    describe("visit the settings page", function() {
        // Initialize the browser.
        const browser = new Browser({
            silent: true
        });

        // Before running the test.
        before(function(done) {
            browser.visit('/settings', done);
        });

        it('should be successful', function() {
            browser.assert.success();
        });

        it("should have a 200 status", function() {
            browser.assert.status(200);
        });

        it('should see App Settings title', function() {
            browser.assert.text(".title", "App Settings");
        });

        it('should have "New Apps" button', function() {
            browser.assert.text(".new-apps-button", "New App");
        });

        describe("Initially", function() {
            it("there should be no components", function() {
                browser.assert.elements(".component", {exactly: 0});
            });
        });

        describe("and perform adding a new app.", function() {
            it("Clicking the \"New Apps\" button", function(done) {
                browser.clickLink(".new-apps-button", done);
            });

            it("should contain a list with bundles", function() {
                browser.assert.elements(".bundle", {atLeast: 1});
            });
        });

        after(function(){
            browser.destroy();
        });
    });
});
