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

var addID = function(element, id) {
    $(element).attr('id', id);
};

// Logger Object.
function Logger () {
    this.dump = function(title, variable) {
        console.group(title);
            console.log(variable);
            console.groupEnd();
    };

    this.info = function(message) {
        console.log(message);
    };
}

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
        bundle.addClass("bundle");
        addID(bundle, "bundle-" + bundleData.index);

    // Add bundle header.
    var bundleHeader = buidlBundleHeader(bundleData);
    $(bundle).append(bundleHeader);

    // Add bundle configurations.
    // Todo.

    return bundle;
}

function buidlBundleHeader(bundleData) {
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

function buildBundleName(bundleData) {
    var bundleName = $("<div/>");
        bundleName
            .addClass('bundle-name')
            .text(bundleData.bundleInformation.name);

    return bundleName;
}

function buildBundleActions(bundleData) {
    // Create bundle actions div.
    var bundleActions = $("<div/>");
        bundleActions.addClass("bundle-actions");

    if (bundleData.bundleInformation.hasFactory) {
        // Create init button.
        var createButton = buildInitButton(bundleData);

        // Hack: overwrite the text of the button with the create text.
        $(createButton).text("Create new");
        // Hack: overwrite the button action defined in the data attribute.
        $(initButton).attr("data-action", "create");

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
            .attr("id", "init-bundle-" + bundleData.index);

    // Store all bundle information in the button.
    $.each(bundleData.bundleInformation, function(key, value) {
        $(initButton).attr("data-" + key, value);
    });

    // Set button action in data attribute.
    $(initButton).attr("data-action", "create");
    if (bundleData.bundleInformation.hasConfigurations) {
        $(initButton).attr("data-action", "edit");
    }

    // Set button text.
    if (bundleData.bundleInformation.hasConfigurations) {
        $(initButton).text("Edit");
    } else {
        $(initButton).text("Create new");
    }

    return initButton;
}

function showConfigurationPanel(clickedButton) {
    callMethod("getConfigurationOptions", $(clickedButton).data(), function(response) {
        logger.dump("Get Configuration Options Response", response);

        // Wipe screen.
        wipeScreen();

        // Create panel for configurations.
        var configurationPanel = buildConfigurationPanel(response, clickedButton);

        $(configurationPanel).appendTo(".container");
    });
}

function buildConfigurationPanel(configurationOptions, clickedButton) {
    // Create panel.
    var configPanel = $("<div/>");
    $(configPanel).addClass("configPanel");

    // Add configuration title.
    var configPanelTitle = buildConfigPanelTitle(configurationOptions);
    $(configPanelTitle).appendTo(configPanel);

    // Add configuration options.
    var configOptions = buildConfigOptions(configurationOptions);
    $(configOptions).appendTo(configPanel);

    // Add save button.
    var saveButton = buildConfigSaveButton(clickedButton);
    $(saveButton).appendTo(configPanel);

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

function buildConfigSaveButton(clickedButton) {
    // Create the button.
    var saveButton = $("<button>");
        saveButton
            .addClass("save-config-button button config-button btn-green btn-center");

    // Set the text of the button.
    if ($(clickedButton).data("action") == "create") {
        saveButton.text("Create new");
    } else {
        saveButton.text("Save changes");
    }

    // Bind action to save button.
    $(saveButton).on("click", function() {
        var configData = getConfigurationOptionsData();

        if ($(clickedButton).data("action") == "create") {
            callMethod("createConfiguration", configData, function(response) {
                logger.dump("Create configuration response", response);
            });
        }
    });

    return saveButton;
}

function getConfigurationOptionsData() {
    /**
    * The old way.
    */
    // Get serialized config options.
    // This will return a query string.
    // var configData = $("#configurationOptions :input").serialize();
    // logger.dump("Serialized config data.", configData);

    // Deparam the serialized config options.
    // This makes a JSON object from a query string.
    // configData = $.deparam(configData);
    // logger.dump("Deparamed config data.", configData);

    /**
     * The new way.
     */
    var configData = [];

    // Iterate over all config fields.
    $.each($("#configurationOptions :input"), function(index, field) {
        logger.dump("Index: " + index, field);

        // Add configuration option data.
        var configOptionData = {};
            configOptionData.name = $(field).attr("name");
            configOptionData.type = $(field).data("type");

        if ($(field).is("select")) {
            logger.dump("Is select box.", field);
            configOptionData.value = $(field).val();
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
            configOptionData.value = $(field).val();
        }
        // else if ($(field).is("input:number")) {
        //     logger.dump("Is number input.", field);
        // }
        // else {
        //     logger.dump("Is text input.", field);
        // }

        // Push configuration options to the config data object.
        configData.push(configOptionData);
    });

    logger.dump("Build config data object:", configData);

    logger.dump("Parsed config data object:", JSON.stringify(configData));

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
    $(optionLabel)
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
        // inputField = $("<div/>");
    }
    else if (isConfigType_Number(attributeType)) {
        inputField = buildInputField_Number(attributeInformation);
    }
    else if (isConfigType_Radio(attributeType)) {
        inputField = buildInputField_Radio(attributeInformation);
        // inputField = $("<div/>");
    }
    else {
        // inputField = buildInputField_Text(attributeInformation);
        inputField = $("<div/>");
    }

    $(inputField).appendTo(optionField);

    return optionField;
}

function getAttributeType(attributeInformation) {
    return attributeInformation.adType;
}

/**
 * Functions to check input type.
 */
function isConfigType_Select(attributeType) {
    return attributeType == "select";
}

function isConfigType_Checkbox(attributeType) {
    return attributeType == "checkbox";
}

function isConfigType_Number(attributeType) {
    return attributeType == "number";
}

function isConfigType_TextField(attributeType) {
    return attributeType == "text";
}

function isConfigType_Radio(attributeType) {
    return attributeType == "radio";
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
        $(optionRow)
            .attr('value',this.val)
            .text(this.text)
            .prop("selected", this.isDefault);

        // Add the option row.
        selectBox.append(optionRow);
    });

    // Store attribute information in data property.
    storeDataInDataProperty(selectBox, attributeInformation.attribute.ad);

    return selectBox;
}

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
 * Create number input field.
 */
function buildInputField_Number(attributeInformation) {
    // Build the select box.
    var inputField = $('<input/>');
        inputField
            .attr("type", "number")
            .attr("step", 1)
            .attr("value", attributeInformation.attribute.ad.defaultValue[0])
            .attr("name", attributeInformation.attribute.ad.id);

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
    var myBool = $.parseJSON(attributeInformation.attribute.ad.defaultValue[0]);
    return myBool === false;
}

/**
 * Create radio button.
 */
function buildInputField_Radio(attributeInformation) {
    // Create radio button for yes.
    var radioButtonYes = $("<input>");
        radioButtonYes
            .attr("type", "radio")
            .attr("value", 1)
            .attr("name", attributeInformation.attribute.ad.id)
            .prop("checked", isDefaultRadioTrue(attributeInformation))
            .after("Yes");

    // Create radio button for no.
    var radioButtonNo = $("<input>");
        radioButtonNo
            .attr("type", "radio")
            .attr("value", 0)
            .attr("name", attributeInformation.attribute.ad.id)
            .prop("checked", !isDefaultRadioTrue(attributeInformation))
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

function isDefaultRadioTrue(attributeInformation) {
    var myBool = $.parseJSON(attributeInformation.attribute.ad.defaultValue[0]);
    return myBool === true;
}

function addOverlay() {
    var docHeight = $(document).height();

    $("body").append("<div id='overlay'></div>");

    $("#overlay")
        .height(docHeight)
        .css({
            'opacity' : 0.4,
            'position' : 'absolute',
            'top' : 0,
            'left' : 0,
            'background-color' : 'black',
            'width' : '100%',
            'z-index' : 1000
        })
        .click(function() {
            hideOverlay();
        });
}

function hideOverlay() {
    $("#overlay").remove();
}

$(document).ready(function() {
    console.log('Configuration page.');

    loadConfigurableComponents();

});
