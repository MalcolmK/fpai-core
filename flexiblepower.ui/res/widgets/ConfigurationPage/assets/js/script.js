// Global variables.
var logger = new Logger();

function wipeScreen() {
    $(".container").empty();
}

function getConfiguration(clickedButton) {
    // First wipe the screen.
    wipeScreen();

    logger.dump("Bundle information", $(clickedButton).data());

    // Get the configuration of the clicked element.
    callMethod("getConfiguration", $(clickedButton).data(), function(configuration) {
        logger.dump("Retrieved configuration", configuration);
    });
}

function loadConfigurableComponents() {
    // First wipe the screen.
    wipeScreen();

    // Create empty widget list.
    var bundleList = $('<div class="bundleList" id="bundleList">').appendTo('.container');

    // Load all components that are configurable.
    callMethod("loadConfigurableComponents", {}, function(components) {
        logger.dump("Bundle list", components.bundleList);

        // Loop through bundle list.
        var index = 0;
        $.each(components.bundleList, function(pid, bundleInformation) {
            index += 1;

            // Build object with all bundle data.
            var bundleData = {};
            bundleData.index = index;
            bundleData.bundleInformation = bundleInformation;

            var bundle = buildBundleDiv(bundleData);

            // Add bundle to bundle list.
            $(bundleList).append(bundle);
        });
    });
}

function buildBundleDiv(bundleData) {
    // Create bundle div.
    var bundle = $("<div/>");
        bundle
            .addClass("bundle")
            .attr("id", "bundle-" + bundleData.index);

    // Add bundle header.
    var bundleHeader = buildBundleHeader(bundleData);
        bundleHeader.appendTo(bundle);

    // Add bundle configurations.
    if (! _.isUndefined(bundleData.bundleInformation.configurations)) {
        var bundleConfigurations = buildBundleConfigurations(bundleData);
            bundleConfigurations.appendTo(bundle);
    }

    return bundle;
}

function buildBundleHeader(bundleData) {
    // Create bundle header.
    var bundleHeader = $("<div/>");
        bundleHeader.addClass("bundle-header");

    // Add bundle name.
    var bundleName = buildBundleName(bundleData);
        bundleHeader.append(bundleName);

    // Add bundle actions.
    var bundleActions = buildBundleActions(bundleData);
        bundleHeader.append(bundleActions);

    return bundleHeader;
}

function buildBundleConfigurations(bundleData) {
    var bundleConfigurations = $("<div/>");
        bundleConfigurations
            .addClass("existing-configurations");

    var bundleConfigsHeader = buildBundleConfigsHeader(bundleData);
        bundleConfigsHeader.appendTo(bundleConfigurations);

    var bundleConfigurationsList = $("<div/>");
        bundleConfigurationsList
            .addClass("existing-configurations-list");

    $.each(bundleData.bundleInformation.configurations, function(index, bundleConfiguration) {
        bundleConfiguration = buildBundleConfiguration(index, bundleData);
        bundleConfiguration.appendTo(bundleConfigurationsList);
    });

    bundleConfigurationsList.appendTo(bundleConfigurations);

    return bundleConfigurations;
}

function buildBundleConfigsHeader(bundleData) {
    var bundleConfigsHeader = $("<div/>");
        bundleConfigsHeader
            .addClass("existing-configurations-header")
            .text("Existing configurations of " + bundleData.bundleInformation.name);

    return bundleConfigsHeader;
}

function buildBundleConfiguration(index, bundleData) {
    var bundleConfiguration = $("<div/>");
        bundleConfiguration
            .addClass("existing-configuration");

    var bundleConfigurationHeader = buildBundleConfigurationHeader(index, bundleData);
        bundleConfigurationHeader.appendTo(bundleConfiguration);

    return bundleConfiguration;
}

function buildBundleConfigurationHeader(index, bundleData) {
    // Create bundle header.
    var bundleHeader = $("<div/>");
        bundleHeader.addClass("existing-configuration-header");

    // Add bundle name.
    var bundleName = buildBundleName(bundleData);
        bundleHeader.append(bundleName);

    // Add bundle actions.
    var bundleActions = buildBundleActions(bundleData.bundleInformation.configurations[index]);
        bundleHeader.append(bundleActions);

    return bundleHeader;
}

function buildBundleName(bundleData) {
    var bundleName = $("<div/>");
        bundleName
            .addClass('bundle-name')
            .text(bundleData.bundleInformation.name);

    return bundleName;
}

function buildBundleActions(bundleData) {
    logger.dump("Configuring bundle actions, with bundleData:", bundleData);

    // Create bundle actions div.
    var bundleActions = $("<div/>");
        bundleActions.addClass("bundle-actions");

    if (bundleData.bundleInformation.hasFactory) {
        logger.info("Bundle has factory.");

        // Create init button.
        var createButton = buildInitButton(bundleData);

        // Hack: overwrite the text of the button with the create text.
        // $(createButton).text("Create new");
        // Hack: overwrite the button action defined in the data attribute.
        // $(initButton).attr("data-action", "create");

        // Bind click action.
        $(createButton).click(function() {
            showConfigurationPanel(this);
        });

        // Add init button to actions div.
        $(bundleActions).append(createButton);
    } else {
        // Create init button.
        var initButton = buildInitButton(bundleData);

        // Bind click action.
        $(initButton).click(function() {
            showConfigurationPanel(this);
        });

        // Add init button to actions div.
        $(bundleActions).append(initButton);
    }

    return bundleActions;
}

function buildInitButton(bundleData) {
    // Create the button.
    var initButton = $("<button/>");
        initButton
            .addClass("bundle-button button btn-black")
            .attr("id", "init-bundle-" + bundleData.index)
            .attr("data-action", "create")
            .text("Create new");

    // Store all bundle information in the button.
    $.each(bundleData.bundleInformation, function(key, value) {
        initButton.attr("data-" + key.toDash(), value);
    });

    // Overwrite some default settings.
    if (bundleData.bundleInformation.hasConfigurations && ! bundleData.bundleInformation.hasFactory) {
        initButton
            .attr("data-action", "edit")
            .text("Edit");
    }

    return initButton;
}

function showConfigurationPanel(clickedButton) {
    callMethod("getConfigurationOptions", $(clickedButton).data(), function(response) {
        logger.dump("Get Configuration Options Response", response);

        // Create panel for configurations.
        var configurationPanel = buildConfigurationPanel(response, clickedButton);
            configurationPanel.appendTo(".container");

        // Remember the scroll position.
        var tempScrollPosition = $(window).scrollTop();

        // Add an overlay so it looks like the config panel is a modal.
        addOverlay(configurationPanel, function() {
            wipeScreen();
            loadConfigurableComponents();

            // Return to old scroll position.
            setTimeout(function() {
                $(window).scrollTop(tempScrollPosition + 20);
            }, 100);
        });
    });
}

function buildConfigurationPanel(configurationOptions, clickedButton) {
    logger.info("Entering building configuration Panel");
    logger.dump("Configuration options:", configurationOptions);
    logger.dump("Clicked buttion:", clickedButton);

    // Create panel.
    var configPanel = $("<div/>");
        configPanel.addClass("configPanel");

    // Add configuration title.
    var configPanelTitle = buildConfigPanelTitle(configurationOptions);
        configPanelTitle.appendTo(configPanel);

    // Add configuration options.
    var configOptions = buildConfigOptions(configurationOptions);
        configOptions.appendTo(configPanel);

    // Add save button.
    var saveButton = buildConfigSaveButton(configurationOptions, clickedButton);
        saveButton.appendTo(configPanel);

    return configPanel;
}

function buildConfigPanelTitle(configurationOptions) {
    // Create the title.
    var configTitle = $("<h2></h2>");
        configTitle
            .addClass("configTitle")
            .text(configurationOptions.information.OCD.Name);

    return configTitle;
}

function buildConfigOptions(configOptions) {
    // Create the config options container.
    var configOptionsContainer = $("<div/>");
        configOptionsContainer
            .addClass("configurationOptions")
            .attr("id", "configurationOptions");

    // Iterate over the options and create the appropiate
    // input field.
    $.each(configOptions.information.ADs, function(index, attributeInformation) {
        console.group("Index: " + index);
            console.log('Attribute: ');
            console.log(attributeInformation);
            console.groupEnd();

        var configOption = buildConfigOption(index, attributeInformation);

        $(configOption).appendTo(configOptionsContainer);
    });

    return configOptionsContainer;
}

function buildConfigSaveButton(configurationOptions, clickedButton) {
    logger.dump("Configuration options when building config save button.", configurationOptions);

    // Create the button.
    var saveButton = $("<button>");
        saveButton
            .addClass("save-config-button button config-button btn-black btn-center");

    // Set the text of the button.
    if ($(clickedButton).data("action") == "create") {
        saveButton.text("Create new");
    } else {
        saveButton.text("Save changes");
    }

    // Set extra data about the bundle in the button.
    saveButton.attr("data-bundle-id", configurationOptions.information.id);
    saveButton.attr("data-bundle-location", configurationOptions.information.location);
    saveButton.attr("data-bundle-has-factory", $(clickedButton).data("has-factory"));

    if ($(clickedButton).data("has-fpid")) {
        saveButton.attr("data-bundle-has-fpid", $(clickedButton).data("has-fpid"));
        saveButton.attr("data-bundle-fpid", $(clickedButton).data("fpid"));
    }

    // Bind action to save button.
    $(saveButton).on("click", function() {
        var configData = getConfigurationOptionsData(this);

        if ($(clickedButton).data("action") == "create") {
            callMethod("createConfiguration", [configData], function(response) {
                logger.dump("Create configuration response", response);
                $("#overlay").trigger("click");
            });
        } else {
            callMethod("updateConfiguration", [configData], function(response) {
                logger.dump("Update configuration response", response);
                $("#overlay").trigger("click");
            });
        }
    });

    return saveButton;
}

function getConfigurationOptionsData(clickedSaveButton) {
    var configData = {};

    // Add data attributes to configData.
    $.each($(clickedSaveButton).data(), function(key, value) {
        configData[key.toDash()] = value;
    });

    // Iterate over all config fields.
    $.each($("#configurationOptions :input"), function(index, field) {
        logger.dump("Index: " + index, field);

        if ($(field).is("select")) {
            logger.dump("Is select box.", field);
            // configOptionData.value = $(field).val();
            configData[$(field).attr("name")] = $(field).val();
        }
        // else if ($(field).is("input:checkbox")) {
        //     logger.dump("Is checkbox.", field);
        // }
        else if ($(field).is(":radio")) {
            logger.dump("Is radio button.", field);
            // If not checked, go to next element.
            if ( !$(field).is(":checked")) {
                return;
            }
            configData[$(field).attr("name")] = $(field).val();
        }
        // else if ($(field).is("input:number")) {
        //     logger.dump("Is number input.", field);
        // }
        else {
            logger.dump("Is text input.", field);
            configData[$(field).attr("name")] = $(field).val();
        }
    });

    logger.dump("Build config data object:", configData);

    return configData;
}

function buildConfigOption(index, attributeInformation) {
    // Create the option container.
    var optionContainer = $("<div/>");
        optionContainer.addClass("configurationOption");

    // Add the label.
    var label = buildOptionLabel(attributeInformation);
        label.appendTo(optionContainer);

    // Add the intput field.
    var inputField = buildInputField(attributeInformation);
        inputField.appendTo(optionContainer);

    return optionContainer;
}

function buildOptionLabel(attributeInformation) {
    // Create option label.
    var optionLabel = $("<div/>");
        optionLabel
            .addClass("optionLabel")
            .text(attributeInformation.attribute.ad.name);

    return optionLabel;
}

function buildInputField(attributeInformation) {
    // Create the input field.
    var optionField = $("<div/>");
        optionField.addClass("optionField");

    var attributeType = getAttributeType(attributeInformation);
    var inputField;

    if (isConfigType_Select(attributeType)) {
        inputField = buildInputField_Select(attributeInformation);
    }
    else if (isConfigType_Checkbox(attributeType)) {
        inputField = buildInputField_Checkbox(attributeInformation);
    }
    else if (isConfigType_Integer(attributeType)) {
        inputField = buildInputField_Integer(attributeInformation);
    }
    else if (isConfigType_Double(attributeType)) {
        inputField = buildInputField_Double(attributeInformation);
    }
    else if (isConfigType_Radio(attributeType)) {
        inputField = buildInputField_Radio(attributeInformation);
    }
    else {
        inputField = buildInputField_Text(attributeInformation);
    }

    $(inputField).appendTo(optionField);

    return optionField;
}

function storeDataInDataProperty(element, data) {
    // Store attribute information in data property.
    $.each(data, function(key, value) {
        $(element).attr("data-" + key, value);
    });
}

/**
 * Create select box.
 */
function buildInputField_Select(attributeInformation) {
    // Build the select box.
    var selectBox = $('<select>');
        selectBox.attr("name", attributeInformation.attribute.ad.id);

    // Get the options for the select box.
    var selectBoxArray = createSelectBoxArray(attributeInformation);

    // Add the options to the select box.
    $(selectBoxArray).each(function() {
        // Build the option row.
        var optionRow = $("<option>");
            optionRow
                .attr('value',this.val)
                .text(this.text);

        // Set if current option is selected.
        if (! _.isUndefined(attributeInformation.value)) {
            if (this.val == attributeInformation.value) {
                optionRow.prop("selected", "selected");
            }
        } else {
            if (this.isDefault) {
                optionRow.prop("selected", "selected");
            }
        }

        // Add the option row.
        selectBox.append(optionRow);
    });

    // Store attribute information in data property.
    storeDataInDataProperty(selectBox, attributeInformation.attribute.ad);

    return selectBox;
}

/**
 * Create integer input field.
 */
function buildInputField_Integer(attributeInformation) {
    // Build the input field.
    var inputField = $('<input/>');
        inputField
            .attr("type", "number")
            .attr("step", 1)
            .attr("name", attributeInformation.attribute.ad.id);

    // Set value.
    var value = getInputValue(attributeInformation);
    inputField.attr("value", value);

    // Store attribute information in data property.
    storeDataInDataProperty(inputField, attributeInformation.attribute.ad);

    return inputField;
}

/**
 * Create double input field.
 */
function buildInputField_Double(attributeInformation) {
    // Build the input field.
    var inputField = $('<input/>');
        inputField
            .attr("type", "number")
            .attr("step", 0.1)
            .attr("name", attributeInformation.attribute.ad.id);

    // Set the value.
    var value = getInputValue(attributeInformation);
    inputField.attr("value", value);

    // Store attribute information in data property.
    storeDataInDataProperty(inputField, attributeInformation.attribute.ad);

    return inputField;
}

/**
 * Create text input field.
 */
function buildInputField_Text(attributeInformation) {
    // Build the input field.
    var inputField = $('<input/>');
        inputField
            .attr("type", "text")
            .attr("name", attributeInformation.attribute.ad.id);

    // Set placeholder if possible.
    if (! _.isUndefined(attributeInformation.attribute.ad.defaultValue)) {
        inputField.attr("placeholder", attributeInformation.attribute.ad.defaultValue[0]);
    }

    // Set value.
    var value = getInputValue(attributeInformation);
    inputField.attr("value", value);

    // Store attribute information in data property.
    storeDataInDataProperty(inputField, attributeInformation.attribute.ad);

    return inputField;
}

/**
 * Create checkbox.
 */
function buildInputField_Checkbox(attributeInformation) {
    // Create the checkbox.
    var inputField = $("<input/>");
        inputField
            .attr("type", "checkbox")
            .attr("value", 1)
            .prop("checked", isDefaultCheckboxChecked(attributeInformation))
            .attr("name", attributeInformation.attribute.ad.id)
            .after(attributeInformation.attribute.ad.name);

    // Store attribute information in data property.
    storeDataInDataProperty(inputField, attributeInformation.attribute.ad);

    return inputField;
}

function isDefaultCheckboxChecked(attributeInformation) {
    return _.isEqual(
        $.parseJSON(attributeInformation.attribute.ad.defaultValue[0]),
        false);
}

/**
 * Create radio button.
 */
function buildInputField_Radio(attributeInformation) {
    // Create radio button for yes.
    var radioButtonYes = $("<input>");
        radioButtonYes
            .attr("type", "radio")
            .attr("value", true)
            .attr("name", attributeInformation.attribute.ad.id)
            .prop("checked", isCheckedRadioTrue(attributeInformation))
            .after("Yes");

    // Create radio button for no.
    var radioButtonNo = $("<input>");
        radioButtonNo
            .attr("type", "radio")
            .attr("value", false)
            .attr("name", attributeInformation.attribute.ad.id)
            .prop("checked", !isCheckedRadioTrue(attributeInformation))
            .after("No");

    // Store attribute information in data property.
    storeDataInDataProperty(radioButtonYes, attributeInformation.attribute.ad);
    storeDataInDataProperty(radioButtonNo, attributeInformation.attribute.ad);

    // Wrap radio buttons.
    var wrapper = $("<div/>");
        wrapper
            .addClass("radiobutton-wrapper")
            .append(radioButtonYes)
            .append(radioButtonNo);

    return wrapper;
}

function isCheckedRadioTrue(attributeInformation) {
    if (_.isUndefined(attributeInformation.value)) {
        logger.info("Value in attribute information is undefined.");
        return isDefaultRadioTrue(attributeInformation);
    }

    return _.isEqual(attributeInformation.value, true);
}

function isDefaultRadioTrue(attributeInformation) {
    return _.isEqual(
        $.parseJSON(attributeInformation.attribute.ad.defaultValue[0]),
        true
    );
}

function addOverlay(frontElement, callback) {
    var docHeight = $(document).height();

    $("body").append("<div id='overlay'></div>");

    $("#overlay")
        .height(docHeight)
        .css({
            'opacity' : 0.7,
            'position' : 'absolute',
            'top' : 0,
            'left' : 0,
            'background-color' : 'black',
            'width' : '100%',
            'z-index' : 1000
        })
        .click(function() {
            hideOverlay(frontElement, callback);
        });

    // Disable scrolling the background.
    // Todo: not working as it is supposed to.
    // With thanks to: http://stackoverflow.com/questions/7600454/how-to-prevent-page-scrolling-when-scrolling-a-div-element
    // $("body").bind("mousewheel DOMMouseScroll", function(e) {
    //     var e0 = e.originalEvent,
    //         delta = e0.wheelDelta || -e0.detail;

    //     this.scrollTop += (delta < 0 ? 1 : -1) * 30;
    //     e.preventDefault();
    // });
}

function hideOverlay(frontElement, callback) {
    $(frontElement).remove();
    $("#overlay").remove();

    callback();
}

// > Document ready.
$(document).ready(function() {
    console.log('Configuration page.');

    loadConfigurableComponents();
});

/**
 * > Helper functions.
 */

/**
 * >> General helpers.
 */
var callMethod = function(method, data, callback) {
    $.ajax(method, {
        type: "POST",
        dataType: "json",
        data: JSON.stringify(data),
        success: callback
    });

    // $.ajax("getConfiguration", {
    //     "type": "POST",
    //     "data" : JSON.stringify($(clickedButton).data()),
    //     "dataType": "json"
    // }).done(function(configuration) {
    //     console.group("Retrieved configuration:");
    //         console.log(configuration);
    //         console.groupEnd();
    // }).error(function(data) {
    //     console.log(data.responseText);
    // });
};

// Logger Object.
function Logger () {
    this.dump = function(msg, variable) {
        // Only variable is defined.
        if (_.isUndefined(msg)) {
            console.debug(variable);

        // Only the message is defined.
        } else if (_.isUndefined(variable)) {
            console.debug(msg);

        // Both the message and the variable are defined.
        } else {
            console.groupCollapsed(msg);
                console.debug(variable);
                console.groupEnd();
        }
    };

    this.info = function(msg, variable) {
        // Only variable is defined.
        if (_.isUndefined(msg)) {
            console.info(variable);

        // Only the message is defined.
        } else if (_.isUndefined(variable)) {
            console.info(msg);

        // Both the message and the variable are defined.
        } else {
            console.groupCollapsed(msg);
                console.info(variable);
                console.groupEnd();
        }
    };

    this.warn = function(msg, variable) {
        // Only variable is defined.
        if (_.isUndefined(msg)) {
            console.warn(variable);

        // Only the message is defined.
        } else if (_.isUndefined(variable)) {
            console.warn(msg);

        // Both the message and the variable are defined.
        } else {
            console.groupCollapsed(msg);
                console.warn(variable);
                console.groupEnd();
        }
    };
}

// Extend the String prototype Object.
String.prototype.toDash = function() {
    return this.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
};

String.prototype.toCamel = function(){
    return this.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
};

/**
 * >> Helper functions to check input type.
 */
function getAttributeType(attributeInformation) {
    return attributeInformation.adType;
}

function isConfigType_Select(attributeType) {
    return attributeType == "select";
}

function isConfigType_Checkbox(attributeType) {
    return attributeType == "checkbox";
}

function isConfigType_Integer(attributeType) {
    return attributeType == "integer";
}

function isConfigType_Double(attributeType) {
    return attributeType == "double";
}

function isConfigType_TextField(attributeType) {
    return attributeType == "text";
}

function isConfigType_Radio(attributeType) {
    return attributeType == "radio";
}

/**
 * >> Helper functions for building input fields.
 */

/**
 * >>> For the select box.
 */
function createSelectBoxArray(attributeInformation) {
    var options = [];

    $.each(attributeInformation.attribute.ad.optionValues, function(index, value) {
        options.push(
            {
                val : attributeInformation.attribute.ad.optionValues[index],
                text : attributeInformation.attribute.ad.optionLabels[index],
                isDefault : isDefaultSelectValue(attributeInformation, index)
            }
        );
    });

    return options;
}

function isDefaultSelectValue(attributeInformation, index) {
    return attributeInformation.attribute.ad.optionValues[index] == attributeInformation.attribute.ad.defaultValue[0];
}

/**
 * >>> For the types integer, double, text.
 */
function getInputValue(attributeInformation) {
    // Set value.
    var value = null;
    if (! _.isUndefined(attributeInformation.value)) {
        value = attributeInformation.value;
    } else if (! _.isUndefined(attributeInformation.attribute.ad.defaultValue)) {
        value = attributeInformation.attribute.ad.defaultValue[0];
    }
    return value;
}
