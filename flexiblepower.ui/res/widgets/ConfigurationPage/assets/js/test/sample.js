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

function openSettingsPage () {
    casper.log("Executing the \"openTheSettingsPage\" before hook.", "info");

    // Go to the settings page.
    casper.thenOpen("http://localhost:8080/settings/index.html");

    casper.waitForSelector(".new-apps-button",
        function then () {
            // Then nothing, just be sure we are the correct page.
        }, function onTimeout () {
            casper.log("Could not load the settings page.", "error");
        }, 5000
    );
}

function openNewAppsPage () {
    // Open the settings page.
    openSettingsPage();

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
}

before(function configureCasper () {
    casper.start();
    casper.options.verbose = true;
    casper.options.logLevel = "info";

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
});

describe('Testing the settings page:', function() {
    describe("testing some general stuff,", function () {
        before("Open the settings page.", function openTheSettingsPage () {
            openSettingsPage();
        });

        it('should give the settings page', function () {
            expect(casper.getHTML('title')).to.have.string("FlexiblePower Suite");
        });

        it("initially there should be no components", function() {
            expect(casper.exists('.component')).to.be.false;
        });

        it('expect a title attribute', function () {
            expect(casper.exists('.title')).to.be.true;
        });

        it('expect to have "App Settings" in the title', function () {
            expect(casper.getHTML(".title")).to.have.string("App Settings");
        });

        it('should have "New Apps" button', function() {
            expect(casper.exists(".new-apps-button")).to.be.true;
            expect(casper.exists(".new-apps-buttons")).to.be.false; /* This is to be sure the previous test is valid. */
            expect(casper.getHTML(".new-apps-button")).to.have.string("New App");
        });
    });

    describe("test the bundle list:", function () {
        before(function beforeTestingBundleList () {
            // Open the new apps page.
            openNewAppsPage();
        });

        it("should have a bundle list", function () {
            expect(casper.exists(".bundleList")).to.be.true;
        });

        it("should have at least 1 bundle in the list", function () {
            expect(casper.exists(".bundle")).to.be.true;
        });

        it("should have a button to return to the \"App Settings\"", function () {
            expect(casper.exists(".back-to-app-settings-button")).to.be.true;
            expect(casper.getHTML(".back-to-app-settings-button")).to.have.string("App Settings");
        });

        describe("test the \"Settings Widget Configuration\":", function () {
            it.skip("should have an id");

            describe("Checking the data attributes:", function () {
                it.skip("should have data attributes");

                it.skip("should have a data-action attribute");

                it.skip("should have a data-action attribute with the value \"create\"");
            });
        });
    });

    describe("test the configuration panel:", function () {
        var bundleWidget;
        var buttonID;
        var saveButton;
        var configOptions;

        before("Find and click on an add button", function () {
            // Open the New Apps page.
            openNewAppsPage();

            bundleWidget = casper.getElementInfo('div.bundle');

            buttonID = "init-" + bundleWidget.attributes.id;

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
            var expectedTitle = bundleWidget.attributes['data-name'];
            var realTitle = casper.getHTML('.configPanel .configTitle');
            expect(realTitle).to.have.string(expectedTitle);
        });

        it("should have at least 1 configuration option", function () {
            expect(casper.exists(".configurationOptions .configurationOption")).to.be.true;
        });

        it("should return to the \"App Settings\" page when clicking the \"Create new\" button", function () {
            expect(saveButton.text).to.have.string("Create new");
        });
    });

    describe("test the data attributes of the configuration options:", function () {
        var configurationOptions;

        before("before testing the data attributes of the config panel", function () {
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

                        return {
                            "class": configOptionNode.getAttribute('class'),
                            "childs": {
                                "value": getOptionFieldValue(optionFields),
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

            // Open the New Apps page.
            openNewAppsPage();

            bundleWidget = casper.getElementInfo('div.bundle');
            buttonID = "init-" + bundleWidget.attributes.id;

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

        it("should have the correct default value set", function () {
            for (var i = 0; i < configurationOptions.length; i += 1) {
                casper.log("Testing configuration option number: " + i, "debug");
                configurationOption = configurationOptions[i].childs;
                defaultValue = configurationOption.optionFields[0].dataset['defaultValue'];
                actualValue = configurationOption.value;
                casper.log("Default value: " + defaultValue, "debug");
                casper.log("Actual value: " + actualValue, "debug");
                expect(actualValue).to.have.string(defaultValue);
            }
        });
    });

    describe("test the \"Create New\" button attributes of the config panel:", function () {
        var bundleWidget;
        var buttonID;
        var saveButton;
        var configOptions;
        before("Find and click on an add button", function () {
            // Open the New Apps page.
            openNewAppsPage();

            bundleWidget = casper.getElementInfo('div.bundle');
            buttonID = "init-" + bundleWidget.attributes.id;

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

    describe("test canceling the create of a new app,", function () {
        var bundle;
        var buttonID;

        beforeEach("Show the configuration panel for canceling.", function showConfigPanelForCancel () {
            // Open the new apps page.
            openNewAppsPage();

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
    });
});
