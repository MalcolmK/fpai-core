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
var _ = require('underscore');
var $ = require('jquery');

before(function loadingSettingsPage () {
    casper.start();
    casper.options.verbose = true;
    casper.options.logLevel = "debug";

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
                var saveButton;
                var configOptions;

                before("Find and click on the add button for the \"Settings Widget Configuration\"", function () {
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
                            saveButton = casper.getElementInfo('.save-config-button');
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

                describe("test the \"Create New\" button attributes:", function () {
                    it("should have the 'bundle-id' attribute", function () {
                        expect(saveButton.attributes['data-bundle-id']).to.exist;
                    });

                    it("should have the 'location' attribute", function () {
                        expect(saveButton.attributes['data-location']).to.exist;
                    });

                    it("should have the 'has-factory' attribute", function () {
                        expect(saveButton.attributes['data-has-factory']).to.exist;
                    });

                    it("should have the 'has-fpid' attribute", function () {
                        expect(saveButton.attributes['data-has-fpid']).to.exist;
                    });

                    it("should have the text \"Create new\"", function () {
                        expect(saveButton.text).to.have.string("Create new");
                    });
                });

                it.skip("should have at least 1 configuration option", function () {
                    expect(configOptions.length).to.be.at.least(1);
                });

                describe("test the configuration options:", function () {
                    var configurationOptions;

                    before("blablabla", function () {
                        function findConfigurationOptions () {
                            var filter, map;
                            filter = Array.prototype.filter;
                            map = Array.prototype.map;

                            function getOptionFields (element) {
                                var childNodes = element.childNodes;
                                var countChildNodes = childNodes.length;
                                var optionFields = [];
                                for (var i = 0; i < countChildNodes; i += 1) {
                                    if (isInputType(childNodes[i])) {
                                        optionFields.push(childNodes[i]);
                                    } else {
                                        if (childNodes[i].childNodes.length > 0) {
                                            var optionField = getOptionFields(childNodes[i]);
                                            optionFields.push(optionField);
                                        }
                                    }
                                }

                                return optionFields;
                            }

                            function isInputType (element) {
                                if (element.tagName == "SELECT") {
                                    return true;
                                }

                                if (element.tagName == "INPUT") {
                                    return true;
                                }

                                return false;
                            }

                            function getOptionFieldValue (element) {
                                if (Array.isArray(element)) {
                                    element = element[0];
                                }

                                if (element.type == "radio") {
                                    var radioButtonFields = document.getElementsByName(element.name);
                                    for (var i = 0; i < radioButtonFields.length; i += 1) {
                                        if (radioButtonFields[i].checked) {
                                            return radioButtonFields[i].value;
                                        }
                                    }
                                }

                                return element.value;
                            }

                            return map.call(
                                filter.call(
                                    document.querySelectorAll(".configurationOption"),
                                    function (element) {
                                        return element;
                                    }
                                ), function (configOptionNode) {
                                    var childNodes = configOptionNode.childNodes;
                                    var optionLabelNode = childNodes[0];
                                    var optionFieldNode = childNodes[1];
                                    var optionFields = getOptionFields(optionFieldNode)[0];
                                    var optionFieldsList = [];
                                    if (Array.isArray(optionFields)) {
                                        for (var i = 0; i < optionFields.length; i += 1) {
                                            var tmp = {
                                                "index": i,
                                                "dataset": JSON.parse(JSON.stringify(optionFields[i].dataset)),
                                                "value": optionFields[i].value
                                            };
                                            optionFieldsList.push(tmp);
                                        }
                                    } else {
                                        var tmp = {
                                            "index": 0,
                                            "dataset": JSON.parse(JSON.stringify(optionFields.dataset)),
                                            "value": optionFields.value
                                        };
                                        optionFieldsList.push(tmp);
                                    }
                                    optionFieldsList.push({"value" : getOptionFieldValue(optionFields)});

                                    return {
                                        "class": configOptionNode.getAttribute('class'),
                                        "childs": {
                                            "optionLabel": {
                                                "textContent": optionLabelNode.textContent,
                                                "class": optionLabelNode.getAttribute("class")
                                            },
                                            "optionFields": optionFieldsList
                                        }
                                    };
                                }
                            );
                        }

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
                                configurationOptions = casper.evaluate(findConfigurationOptions);
                                casper.log(JSON.stringify(configurationOptions, null, 4), "debug");
                            }, function onTimeout () {
                                casper.log("Config panel could not be loaded.", "error");
                            }, 5000
                        );
                    });

                    var attributesToCheckForExistence = ["defaultValue", "id", "isRequired", "name", "optionLabels", "optionValues", "type"];

                    it("should have the correct text in the label", function () {
                        for (var i = 0; i < configurationOptions.length; i += 1) {
                            casper.log("Testing configuration option number: " + i, "debug");
                            configurationOption = configurationOptions[i].childs;
                            realValue = configurationOption.optionLabel.textContent;
                            for (var j = 0; j < configurationOption.optionFields; j += 1) {
                                casper.log("Testing option field number: " + j, "debug");
                                optionField = configurationOption.optionFields[j];
                                expectedValue = optionField.dataset.name;
                                expect(realValue).to.have.string(expectedValue);
                            }
                        }
                    });

                    attributesToCheckForExistence.forEach(function (attributeName) {
                        it("should have the data attribute \"" + attributeName + "\"", function () {
                            for (var i = 0; i < configurationOptions.length; i += 1) {
                                casper.log("Testing configuration option number: " + i, "debug");
                                configurationOption = configurationOptions[i].childs;
                                for (var j = 0; j < configurationOption.optionFields; j += 1) {
                                    optionField = configurationOption.optionFields[j];
                                    expect(configurationOption.optionField.dataset[attributeName]).to.exist;
                                }
                            }
                        });
                    });

                    it.skip("should have a default value set", function () {
                        for (var i = 0; i < configurationOptions.length; i += 1) {
                            casper.log("Testing configuration option number: " + i, "debug");
                            configurationOption = configurationOptions[i].childs;
                            for (var j = 0; j < configurationOption.optionFields; j += 1) {
                                optionField = configurationOption.optionFields[j];
                                expect(configurationOption.optionField.dataset[attributeName]).to.exist;
                            }
                        }
                    });
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
