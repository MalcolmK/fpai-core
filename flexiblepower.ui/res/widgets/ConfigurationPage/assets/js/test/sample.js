/*
 * !! NOTICE !!
 *
 * This script requires 'ChaiJS' (http://chaijs.com/) and 'ShouldJS' (http://shouldjs.github.io/) to be installed.
 * Mocha-CasperJS does include the 'expect' and 'should' syntax, but not all functionality will be available. By
 * installing them seperately, all the functions will be available.
 */

var chai_expect = require('chai').expect;
var should = require('should');
var util = require('util');

before(function loadingSettingsPage () {
    casper.start();
    casper.options.verbose = true;
    casper.options.logLevel = "warning";

    casper.options.onPageInitialized = function () {
        this.log("Initialized!", "debug");
    };

    casper.options.pageSettings = {
        "localToRemoteUrlAccessEnabled": true
    };

    // Log the browser console log messages by using the CasperJS log feature.
    casper.on('remote.message', function (msg) {
        this.log(msg, "debug");
    });

    // Go to the settings page.
    casper.thenOpen("http://localhost:8080/settings/index.html", function thenOpen () {
        this.log("We are at the correct page.", "info");
    });

    // Wait for some resources to be loaded.
    casper.waitForResource("jquery.min.js",
        function then () {
            this.log("jQuery loaded.", "info");
        }, function onTimeout () {
            this.log("jQuery could not be loaded!", "error");
        }, 1000
    );

    casper.waitForResource("jquery-ui.min.js",
        function then () {
            this.log("jQuery UI loaded.", "info");
        }, function onTimeout () {
            this.log("jQuery UI could not be loaded!", "error");
        }, 1000
    );

    casper.waitForResource("script.js",
        function then () {
            this.log("Script js loaded.", "info");
        }, function onTimeout () {
            this.log("Script js could not be loaded!", "error");
        }, 1000
    );

    casper.waitForResource("plugins.js",
        function then () {
            this.log("Plugins js loaded.", "info");
        }, function onTimeout () {
            this.log("Plugins js could not be loaded!", "error");
        }, 1000
    );

    casper.waitForResource("underscore-min.js",
        function then () {
            this.log("Underscore js loaded.", "info");
        }, function onTimeout () {
            this.log("Underscore js could not be loaded!", "error");
        }, 1000
    );

    casper.waitForResource("jquery.ba-bbq.min.js",
        function then () {
            this.log("jQuery BBQ js loaded.", "info");
        }, function onTimeout () {
            this.log("jQuery BBQ js could not be loaded!", "error");
        }, 1000
    );

    casper.waitForResource("jQuery.headroom.min.js",
        function then () {
            this.log("jQuery headroom js loaded.", "info");
        }, function onTimeout () {
            this.log("jQuery headroom js could not be loaded!", "error");
        }, 1000
    );

    casper.waitForResource("headroom.min.js",
        function then () {
            this.log("headroom js loaded.", "info");
        }, function onTimeout () {
            this.log("headroom js could not be loaded!", "error");
        }, 1000
    );

    casper.waitForResource("jquery.floatingmessage.js",
        function then () {
            this.log("jQuery floatingmessage js loaded.", "info");
        }, function onTimeout () {
            this.log("jQuery floatingmessage js could not be loaded!", "error");
        }, 1000
    );
});

describe('Testing the settings page:', function() {
    it('should give the settings page', function () {
        expect(casper.getHTML('title')).to.have.string("FlexiblePower Suite");
    });

    describe("testing the title:", function () {
        it('expect a title attribute', function () {
            expect(casper.exists('.title')).to.be.true;
        });

        it('expect to have "App Settings" in the title', function () {
            expect(casper.getHTML(".title")).to.have.string("App Settings");
        });
    });

    describe("test adding a new configuration:", function () {
        it('should have "New Apps" button', function() {
            expect(casper.exists(".new-apps-button")).to.be.true;
            expect(casper.exists(".new-apps-buttons")).to.be.false; /* This is to be sure the previous test is valid. */
            expect(casper.getHTML(".new-apps-button")).to.have.string("New App");
        });

        it("initially there should be no components", function() {
            expect(casper.exists('.component')).to.be.false;
        });

        describe("test the bundle list:", function () {
            before(function beforeTestingBundleList () {
                casper.then(function then () {
                    casper.log("Clicking \"New App\" button.", "info");
                    casper.click(".new-apps-button");
                });
                casper.waitForSelector(".bundle",
                    function then () {
                        // Then nothing, just be sure everyting will be loaded.
                    }, function onTimeout () {
                        casper.log("Bundle list could not be loaded.", "error");
                    }, 1000
                );
            });

            it("should have a bundle list", function () {
                expect(casper.exists(".bundleList")).to.be.true;
            });

            it("should have at least 1 bundle in the list", function () {
                expect(casper.exists(".bundle")).to.be.true;
            });

            it.skip("should have a button to return to the \"App Settings\"", function () {
                expect(casper.exists(".back-to-app-settings-button")).to.be.true;
                expect(casper.getHTML(".back-to-app-settings-button")).to.have.string("App Settings");
            });

            describe("test the configuration panel:", function () {
                describe("test canceling the create of a new app,", function () {
                    var bundle;
                    var buttonID;

                    beforeEach("Show the configuration panel for canceling.", function showConfigPanelForCancel () {
                        bundle = casper.getElementInfo('div.bundle');
                        buttonID = "init-" + bundle.attributes.id;

                        casper.then(function then () {
                            casper.click("button#" + buttonID);

                            casper.waitForSelector(".configPanel",
                                function then () {
                                }, function onTimeout () {
                                    casper.log("Config panel could not be loaded.", "error");
                                }, 1000
                            );
                        });
                    });

                    it("should return to the \"New App\" page when hitting the close button", function () {
                        casper.click(".configPanel .btn-close");

                        casper.waitWhileSelector(".configPanel",
                            function then () {
                                expect(casper.exists(".configPanel")).to.be.false;
                                expect(casper.exists("#overlay")).to.be.false;
                                expect(casper.exists(".bundleList")).to.be.true;
                                expect(casper.exists(".bundle")).to.be.true;
                            }, function onTimeout () {
                                casper.log("Config panel could not be closed.", "error");
                            }, 1000
                        );
                    });

                    it("should return to the \"New App\" page when clicking outside the config panel", function () {
                        casper.click("#overlay");

                        casper.waitWhileSelector(".configPanel",
                            function then () {
                                expect(casper.exists(".configPanel")).to.be.false;
                                expect(casper.exists("#overlay")).to.be.false;
                                expect(casper.exists(".bundleList")).to.be.true;
                                expect(casper.exists(".bundle")).to.be.true;
                            }, function onTimeout () {
                                casper.log("Config panel could not be closed.", "error");
                            }, 1000
                        );
                    });

                    afterEach("Make sure we are on the \"New Apps\" page again.", function () {
                        casper.thenOpen("http://localhost:8080/settings/index.html");
                        casper.waitForSelector(".new-apps-button",
                            function then () {
                                // Then nothing, just be sure the button is there.
                                casper.click(".new-apps-button");
                            }, function onTimeout () {
                                casper.log("Could not return to settings page.", "error");
                            }, 5000
                        );
                        casper.waitForSelector(".bundle",
                            function then () {
                                // Then nothing, just be sure everyting will be loaded.
                            }, function onTimeout () {
                                casper.log("Bundle list could not be loaded.", "error");
                            }, 1000
                        );
                    });
                });

                var settingsWidgetBundle;
                var buttonID;
                before("Find the add button for the \"Settings Widget Configuration\"", function () {
                    settingsWidgetBundle = casper.getElementInfo('div.bundle[data-pid="' +
                        'org.flexiblepower.runtime.ui.server.pages.ConfigurationPage"]');

                    buttonID = "init-" + settingsWidgetBundle.attributes.id;

                    casper.log("button id: " + buttonID, "debug");

                    casper.then(function then () {
                        casper.log("button id: " + buttonID, "debug");
                        casper.click("button#" + buttonID);
                    });
                    casper.waitForSelector(".configPanel",
                        function then () {

                        }, function onTimeout () {
                            casper.log("Config panel could not be loaded.", "error");
                        }, 1000
                    );
                });

                it("should have an add button", function () {
                    expect(casper.exists("button#" + buttonID)).to.be.true;
                });

                it("should show the configuration panel when clicking on the add button", function () {
                    expect(casper.exists(".configPanel")).to.be.true;
                });

                it("should have a close button", function () {
                    expect(casper.exists(".configPanel .btn-close")).to.be.true;
                });

                it("should have a title", function () {
                    expect(casper.exists(".configPanel .configTitle")).to.be.true;
                });

                it("should have the correct text in the title", function () {
                    var expectedTitle = settingsWidgetBundle.attributes['data-name'];
                    var realTitle = casper.getHTML('.configPanel .configTitle');
                    expect(realTitle).to.have.string(expectedTitle);
                });

                it("should have at least 1 configuration option", function () {
                    expect(casper.exists(".configurationOptions .configurationOption")).to.be.true;
                });

                describe("test the \"Create New\" button:", function () {
                    it("should have a button for creating the new configuration");

                    it("should have the 'bundle-id' attribute");

                    it("should have the 'location' attribute");

                    it("should have the 'has-factory' attribute");

                    it("should have the 'has-fpid' attribute");

                    it("should have the text \"Create new\"");

                });

                it("should return to the \"App Settings\" page when clicking the \"Create new\" button");
            });

            it("should have a bundle with the text \"Settings Widget Configuration\"");

            describe("test the \"Settings Widget Configuration\":", function () {
                it("should have an id");

                describe("Checking the data attributes:", function () {
                    it("should have data attributes");

                    it("should have a data-action attribute");

                    it("should have a data-action attribute with the value \"create\"");
                });
            });
        });
    });
});
