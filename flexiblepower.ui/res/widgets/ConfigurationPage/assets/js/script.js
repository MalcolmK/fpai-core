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
        var configurationPanel = buildConfigurationPanel(response);

        $(configurationPanel).appendTo(".container");
    });
}

function buildConfigurationPanel(configurationOptions) {
    // Create panel.
    var configPanel = $("<div/>");
    $(configPanel).addClass("configPanel");

    // Add configuration title.
    var configPanelTitle = buildConfigPanelTitle(configurationOptions);
    $(configPanelTitle).appendTo(configPanel);

    // Add configuration options.
    var configOptions = buildConfigOptions(configurationOptions);
    $(configOptions).appendTo(configPanel);

    return configPanel;
}

function buildConfigPanelTitle(configurationOptions) {
    // Create the title.
    var configTitle = $("<h2></h2>");
    $(configTitle)
        .addClass("configTitle")
        .text(configurationOptions.information.OCD.Name);

    return configTitle;
}

function buildConfigOptions(configOptions) {
    // Create the config options container.
    var configOptionsContainer = $("<div/>");
    $(configOptionsContainer).addClass("configurationOptions");

    $.each(configOptions.information.ADs, function(key, value) {
        console.log("Key: " + key);
        console.log('Value: ' + value);

        var configOption = buildConfigOption(key, value);

        $(configOption).appendTo(configOptionsContainer);
    });

    return configOptionsContainer;
}

function buildConfigOption(key, value) {
    // Create the option container.
    var optionContainer = $("<div/>");
    $(optionContainer).addClass("configurationOption");

    // Add the label.
    var label = buildOptionLabel(key);
    $(label).appendTo(optionContainer);

    // Add the intput field.
    var inputField = buildInputField(value);
    $(inputField).appendTo(optionContainer);

    return optionContainer;
}

function buildOptionLabel(key) {
    // Create option label.
    var optionLabel = $("<div/>");
    $(optionLabel)
        .addClass("optionLabel")
        .text(key);

    return optionLabel;
}

function buildInputField(value) {
    // Create the input field.
    var inputField = $("<div/>");
    $(inputField).addClass("optionField");

    if (isSelectBox(value.ad)) {
        console.log('Is select box.');
        var selectBoxArray = createSelectBoxArray(value.ad);

        var selectBox = $('<select>').appendTo(inputField);
        $(selectBoxArray).each(function() {
            selectBox.append($("<option>").attr('value',this.val).text(this.text));
        });
    }

    return inputField;
}

function isSelectBox(attributeDefinition) {
    return 'optionValues' in attributeDefinition;
}

function createSelectBoxArray(attributeDefinition) {
    var options = [];
    $.each(attributeDefinition.optionValues, function(index, value) {
        options.push(
            {
                val : attributeDefinition.optionValues[index],
                text : attributeDefinition.optionLabels[index]
            }
        );
    });

    return options;
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
