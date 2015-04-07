// Require the expect to override the expect form casper-chai.
var chai_expect = require('chai').expect;

// Require the should to override the expect form casper-chai.
var should = require('should');

before(function loadingSettingsPage () {
    casper.start();
    casper.options.verbose = true;
    casper.options.logLevel = "debug";

    casper.options.onPageInitialized = function () {
        this.log("Initialized!", "debug");
    }

    casper.options.pageSettings = {
        "localToRemoteUrlAccessEnabled": true
    }

    // Log the browser console log messages by using the CasperJS log feature.
    casper.on('remote.message', function (msg) {
        this.log(msg, "debug");
    });

    // Go to the settings page.
    casper.thenOpen("http://localhost:8080/settings/index.html", function thenOpen () {
        this.log("We are at the correct page.", "info");
    });

    // Wait for some resources to be loaded.
    casper.waitForResource("jquery.min.js"
    ,  function then () {
        this.log("jQuery loaded.", "info");
    }, function onTimeout () {
        this.log("jQuery could not be loaded!", "error");
    }, 1000);

    casper.waitForResource("jquery-ui.min.js"
    ,  function then () {
        this.log("jQuery UI loaded.", "info");
    }, function onTimeout () {
        this.log("jQuery UI could not be loaded!", "error");
    }, 1000);

    casper.waitForResource("script.js"
    ,  function then () {
        this.log("Script js loaded.", "info");
    }, function onTimeout () {
        this.log("Script js could not be loaded!", "error");
    }, 1000);

    casper.waitForResource("plugins.js"
    ,  function then () {
        this.log("Plugins js loaded.", "info");
    }, function onTimeout () {
        this.log("Plugins js could not be loaded!", "error");
    }, 1000);

    casper.waitForResource("underscore-min.js"
    ,  function then () {
        this.log("Underscore js loaded.", "info");
    }, function onTimeout () {
        this.log("Underscore js could not be loaded!", "error");
    }, 1000);

    casper.waitForResource("jquery.ba-bbq.min.js"
    ,  function then () {
        this.log("jQuery BBQ js loaded.", "info");
    }, function onTimeout () {
        this.log("jQuery BBQ js could not be loaded!", "error");
    }, 1000);

    casper.waitForResource("jQuery.headroom.min.js"
    ,  function then () {
        this.log("jQuery headroom js loaded.", "info");
    }, function onTimeout () {
        this.log("jQuery headroom js could not be loaded!", "error");
    }, 1000);

    casper.waitForResource("headroom.min.js"
    ,  function then () {
        this.log("headroom js loaded.", "info");
    }, function onTimeout () {
        this.log("headroom js could not be loaded!", "error");
    }, 1000);

    casper.waitForResource("jquery.floatingmessage.js"
    ,  function then () {
        this.log("jQuery floatingmessage js loaded.", "info");
    }, function onTimeout () {
        this.log("jQuery floatingmessage js could not be loaded!", "error");
    }, 1000);
});

describe('Testing settings page', function() {
    it('should give the settings page', function () {
        casper.then(function then () {
            chai_expect(casper.getTitle()).to.have.string("FlexiblePower Suite");
        });
    });

    describe("test the title", function () {
        it('expect a title attribute', function () {
            casper.then(function then () {
                chai_expect(this.exists('.title')).to.be.true;
            });
        });

        it('expect to have "App Settings" in the title', function () {
            casper.then(function then () {
                chai_expect(this.getHTML(".title")).to.have.string("App Settings");
            });
        });
    });

    describe("test adding a new configuration", function () {
        it('should have "New Apps" button', function() {
            casper.then(function then () {
                chai_expect(this.exists(".new-apps-button")).to.be.true;
                chai_expect(this.getHTML(".new-apps-button")).to.have.string("New App");
            });
        });

        it("initially there should be no components", function() {
            casper.then(function then () {
                expect(this.exists(".component")).to.be.false;
            });
        });

        describe("Test the bundle list", function () {
            before(function beforeTestingBundleList () {
                casper.then(function then () {
                    this.click(".new-apps-button");
                });
            });

            it("should have a bundle list", function () {
                casper.then(function then () {
                    expect(this.exists(".bundleList")).to.be.true;
                });
            });

            it("should have at least 1 bundle in the list", function () {
                casper.evaluate(function evaluate () {
                    expect(this.exists('.bundle')).to.be.true;
                });
            });
            it("should have a button to return to the \"App Settings\"");
            it("should have a bundle with the text \"Settings Widget Configuration\"");
            describe("test the \"Settings Widget Configuration\"", function () {
                it("should have an id");
                describe("Checking the data attributes", function () {
                    it("should have data attributes");
                    it("should have a data-action attribute");
                    it("should have a data-action attribute with the value \"create\"");
                });
            });
        });
    });
});
