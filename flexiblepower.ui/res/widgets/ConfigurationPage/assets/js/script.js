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

function wipeScreen() {
    $(".container").empty();
}

function getConfiguration(clickedButton) {
    // First wipe the screen.
    wipeScreen();

    console.group("Bundle information:");
        console.log($(clickedButton).data());
        console.groupEnd();

    // Get the configuration of the clicked element.
    callMethod("getConfiguration", $(clickedButton).data(), function(configuration) {
        // Debug.
        console.group("Retrieved configuration:");
            console.log(configuration);
            console.groupEnd();


    });
}

function loadConfigurableComponents() {
    // First wipe the screen.
    wipeScreen();

    // Create empty widget list.
    var bundleList = $('<div class="bundleList" id="bundleList">').appendTo('.container');

    // Load all components that are configurable.
    callMethod("loadConfigurableComponents", {}, function(components) {
        console.log(components.bundleList);

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
    $(bundleHeader).append(bundleName);

    // Add bundle actions.
    var bundleActions = buildBundleActions(bundleData);
    $(bundleHeader).append(bundleActions);

    return bundleHeader;
}

function buildBundleName(bundleData) {
    // Create bundle name div.
    var bundleName = $("<div/>");
        bundleName.addClass('bundle-name');

    // Set bundle name.
    $(bundleName).text(bundleData.bundleInformation.name);

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
        $(initButton).addClass("bundle-button button btn-black")
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
        console.group("Get Configuration Options Response");
            console.log(response);
            console.groupEnd();

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
        configOptionsContainer.addClass("configurationOptions");

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


    return saveButton;
}

function buildConfigOption(index, attributeInformation) {
    // Create the option container.
    var optionContainer = $("<div/>");
    $(optionContainer).addClass("configurationOption");

    // Add the label.
    var label = buildOptionLabel(attributeInformation);
    $(label).appendTo(optionContainer);

    // Add the intput field.
    var inputField = buildInputField(attributeInformation);
    $(inputField).appendTo(optionContainer);

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

    if (isSelectbox(attributeType)) {
        var inputField = buildInputField_Select(attributeInformation);
    }
    else if (isCheckbox(attributeType)) {
        var inputField = buildInputField_Checkbox(attributeInformation);
        // var inputField = $("<div/>");
    }
    else if (isNumber(attributeType)) {
        var inputField = buildInputField_Number(attributeInformation);
    }
    else if (isRadio(attributeType)) {
        // var inputField = buildInputField_Radio(attributeInformation);
        var inputField = $("<div/>");
    }
    else {
        // var inputField = buildInputField_Text(attributeInformation);
        var inputField = $("<div/>");
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
function isSelectbox(attributeType) {
    return attributeType == "select";
}

function isCheckbox(attributeType) {
    return attributeType == "checkbox";
}

function isNumber(attributeType) {
    return attributeType == "number";
}

function isTextField(attributeType) {
    return attributeType == "text";
}

function isRadio(attributeType) {
    return attributeType == "radio";
}

/**
 * Create select box.
 */
function buildInputField_Select(attributeInformation) {
    // Build the select box.
    var selectBox = $('<select>');

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
            .attr("value", attributeInformation.attribute.ad.defaultValue[0]);

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
            .after(attributeInformation.attribute.ad.name);

    return inputField;
}

function isDefaultCheckboxChecked(attributeInformation) {
    return attributeInformation.attribute.ad.defaultValue[0] == false;
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
