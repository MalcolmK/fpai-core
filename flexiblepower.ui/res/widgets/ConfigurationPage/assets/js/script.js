// Global variables.
var logger = new Logger();

function wipeScreen() {
    logger.info("Wiping the screen.");
    $(".container").empty();
}

function loadConfiguredComponents() {
    // First wipe the screen.
    wipeScreen();

    // Build the wrapping div for the app settings.
    var appSettingsContainer = $("<div/>");
        appSettingsContainer
            .addClass("configured-components")
            .appendTo(".container");

    // Build the head.
    var head = buildConfiguredComponentsHead();
        head.appendTo(appSettingsContainer);

    // Build the list/grid with all components that are configurated.
    var body = buildConfiguredComponentsBody();
        body.appendTo(appSettingsContainer);
}

function buildConfiguredComponentsHead()
{
    // Build the element.
    var configuredComponentsHead = $("<div/>");
        configuredComponentsHead
            .addClass("configured-components-head");

    // Add the title.
    var title = $("<h1/>");
        title
            .addClass("title")
            .text("App Settings")
            .appendTo(configuredComponentsHead);

    // Add the 'New Apps' button.
    var newAppsButton = buildNewAppsButton();
        newAppsButton.appendTo(configuredComponentsHead);

    // Add clear div.
    var clearDiv = buildClearDiv();
        clearDiv.appendTo(configuredComponentsHead);

    return configuredComponentsHead;
}

function buildNewAppsButton() {
    // Build the encapsulating container.
    var container = $("<div/>");
        container
            .addClass("new-apps-container");

    var newAppsButton = $("<a/>");
        newAppsButton
            .addClass("new-apps-button")
            .on("click", function() {
                loadConfigurableComponents();
            })
            .text("New App")
            .appendTo(container);

    return container;
}

function buildConfiguredComponentsBody() {
    var configuredComponentsBody = $("<div/>");
        configuredComponentsBody
            .addClass("configured-components-body");

    var configuredComponentsList = buildConfiguredComponentsList();
        configuredComponentsList.appendTo(configuredComponentsBody);

    return configuredComponentsBody;
}

function buildConfiguredComponentsList() {
    var configuredComponentsList = $("<div/>");
        configuredComponentsList
            .addClass("configured-components-list")

    // Load all components that are configurable.
    callMethod("getExistingConfigurations", {}, function(components) {
        if (! _.isUndefined(components) && ! _.isNull(components)) {
            logger.dump("Bundle list", components.bundleList);

            // Iterate over bundle list.
            var index = 0;
            $.each(components.bundleList, function(pid, bundleInformation) {
                index += 1;
                // Build object with all bundle data.
                var bundleData = {};
                    bundleData.index = index;
                    bundleData.bundleInformation = bundleInformation;

                if (bundleData.bundleInformation.hasConfigurations && _.isUndefined(bundleData.bundleInformation.configurations)) {
                    var configuredComponent = buildConfiguredComponent(bundleData);
                        configuredComponent.appendTo(configuredComponentsList);
                } else if (! _.isUndefined(bundleData.bundleInformation.configurations)) {
                    $.each(bundleData.bundleInformation.configurations, function(index, bundleConfiguration) {
                        var configuredComponent = buildConfiguredComponent(bundleConfiguration);
                            configuredComponent.appendTo(configuredComponentsList);
                    });
                }
            });

            var clearDiv = buildClearDiv();
                clearDiv.appendTo(configuredComponentsList);
        } else {
            addToTemplate({
                rootDomClass: ".configured-components-body",
                templateClass: ".no-configured-components-template"
            });
        }
    });

    return configuredComponentsList;
}

function loadConfigurableComponents() {
    // First wipe the screen.
    wipeScreen();

    // Create empty widget list.
    var bundleList = $("<div/>");
        bundleList
            .addClass("bundleList")
            .attr("id", "bundleList")
            .appendTo(".container");

    // Load all components that are configurable.
    callMethod("loadConfigurableComponents", {}, function(components) {
        logger.dump("Bundle list", components.bundleList);

        // Iterate over bundle list.
        var index = 0;
        $.each(components.bundleList, function(pid, bundleInformation) {
            index += 1;
            // Build object with all bundle data.
            var bundleData = {};
                bundleData.index = index;
                bundleData.bundleInformation = bundleInformation;

            var bundle = buildBundleDiv(bundleData);
                bundle.appendTo(bundleList);

        });
    });
}

/**
 * > Functions for building the element with the bundle information.
 */
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

function buildConfiguredComponent(componentData) {
    logger.dump("Building configured component:", componentData);
    // Generate a globally unique ID.
    var uniqueID = _.uniqueId("component_");
    componentData.uniqueID = uniqueID;

    // var wrappingDiv = $("<div/>");
        // wrappingDiv
            // .addClass("wrapping-component-div")
            // .attr("id", uniqueID);

    var configuredComponent = $("<div/>");
        configuredComponent
            .addClass("component")
            .attr("id", uniqueID);
            // .appendTo(wrappingDiv);

    // Create the header.
    var configuredComponentHeader = buildConfiguredComponentHeader(componentData);
        configuredComponentHeader.appendTo(configuredComponent);

    // Add bundle name.
    var bundleName = buildConfiguredComponentName(componentData);
        bundleName.appendTo(configuredComponent);


    // return wrappingDiv;
    return configuredComponent;
}

function buildConfiguredComponentHeader(componentData) {
    // Create bundle header.
    var bundleHeader = $("<div/>");
        bundleHeader.addClass("header");

    // Add bundle actions.
    var bundleActions = buildConfiguredComponentActions(componentData);
        bundleHeader.append(bundleActions);

    return bundleHeader;
}

/**
 * >> Bundle header.
 */
function buildBundleHeader(bundleData) {
    logger.dump("Building bundle header with data: ", bundleData);
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

/**
 * >>> Bundle name.
 */
function buildBundleName(bundleData) {
    logger.dump("Building bundle name with bundle data: ", bundleData);
    var bundleName = $("<div/>");
        bundleName
            .addClass('bundle-name')
            .text(bundleData.bundleInformation.name);

    return bundleName;
}

function buildConfiguredComponentName(bundleData) {
    var componentName = $("<div/>");
        componentName
            .addClass("component-name")
            .text(bundleData.bundleInformation.name);

    return componentName;
}

/**
 * >>> Bundle action buttons.
 */
function buildBundleActions(bundleData) {
    logger.dump("Configuring bundle actions, with bundleData:", bundleData);

    // Create bundle actions div.
    var bundleActions = $("<div/>");
        bundleActions.addClass("bundle-actions");

    // Build the create/edit button.
    var initButton = buildInitButton(bundleData);
        initButton.appendTo(bundleActions);

    if (! bundleData.bundleInformation.hasFactory &&
          bundleData.bundleInformation.hasConfigurations) {
        // Build the delete button.
        if (bundleData.bundleInformation.hasConfigurations) {
            var deleteButton = buildDeleteButton(bundleData);
                deleteButton.appendTo(bundleActions);
        }

    }

    return bundleActions;
}

function buildConfiguredComponentActions(componentData) {
    logger.dump("Configuring configured component actions, with componentData:", componentData);

    // Create component actions div.
    var componentActions = $("<div/>");
        componentActions.addClass("actions");

    // Build the edit button.
    var editButton = buildEditButton(componentData);
        editButton.appendTo(componentActions);

    if (! componentData.bundleInformation.hasFactory &&
          componentData.bundleInformation.hasConfigurations) {
        // Build the delete button.
        if (componentData.bundleInformation.hasConfigurations) {
            var deleteButton = buildDeleteButton(componentData);
                deleteButton.appendTo(componentActions);
        }

    }

    return componentActions;
}

/**
 * >>>> The create/edit button.
 */
function buildInitButton(bundleData) {
    // Create the button.
    var initButton = $("<button/>");
        initButton
            .attr("id", "init-bundle-" + bundleData.index)
            .addClass("btn-create")
            .attr("data-action", "create")
            .on("click", function() {
                showConfigurationPanel(this, reloadComponents);
            });

    // Store all bundle information in the button.
    storeDataInDataProperty(initButton, bundleData.bundleInformation);

    return initButton;
}

/**
 * >>>> The edit button.
 */
function buildEditButton(componentData) {
    // Create the button.
    var editButton = $("<button/>");
        editButton
            .attr("id", "edit-component-" + componentData.index)
            .addClass("btn-edit")
            .attr("data-action", "edit")
            .on("click", function() {
                showConfigurationPanel(this, loadConfiguredComponents);
            });

    // Store all bundle information in the button.
    storeDataInDataProperty(editButton, componentData.bundleInformation);

    return editButton;
}

/**
 * >>>> The delete button.
 */
function buildDeleteButton(bundleData) {
    // Create the button.
    var deleteButton = $("<button/>");
        deleteButton
            .addClass("btn-delete")
            .attr("id", "delete-bundle-" + bundleData.index)
            .attr("data-action", "delete");

    // Store all bundle information in the button.
    storeDataInDataProperty(deleteButton, bundleData.bundleInformation);

    // Bind action to delete button.
    $(deleteButton).on("click", function() {
        callMethod(
            "deleteConfiguration",
            $(this).data(),
            function() {

                $("#" + bundleData.uniqueID).hide({
                    effect: "highlight",
                    color: "#EE6C0A"
                }).queue(function() {
                    $(this).remove().dequeue();
                });

                showSuccessMessage({
                    msg : "Widget succesful deleted.",
                    timeout : 800
                });

                // deleteAnimationQueue.dequeue("delete-" + bundleData.uniqueID);
            }
        );
    });

    return deleteButton;
}

/**
 * >> Functions to build the bundle configurations.
 */
function buildBundleConfigurations(bundleData) {
    var bundleConfigurations = $("<div/>");
        bundleConfigurations.addClass("existing-configurations");

    var bundleConfigsHeader = buildBundleConfigsHeader(bundleData);
        bundleConfigsHeader.appendTo(bundleConfigurations);

    var bundleConfigurationsList = $("<div/>");
        bundleConfigurationsList.addClass("existing-configurations-list");

    $.each(bundleData.bundleInformation.configurations, function(index, bundleConfiguration) {
        bundleConfiguration = buildBundleConfiguration(index, bundleData);
        bundleConfiguration.appendTo(bundleConfigurationsList);
    });

    bundleConfigurationsList.appendTo(bundleConfigurations);

    return bundleConfigurations;
}

/**
 * >>> Header of existing configurations.
 */
function buildBundleConfigsHeader(bundleData) {
    var bundleConfigsHeader = $("<div/>");
        bundleConfigsHeader
            .addClass("existing-configurations-header")
            .text("Existing configurations of " + bundleData.bundleInformation.name);

    return bundleConfigsHeader;
}

/**
 * >>> Existing configuration of a bundle.
 */
function buildBundleConfiguration(index, bundleData) {
    logger.dump("Building bundle configuration:", bundleData);
    var bundleConfiguration = $("<div/>");
        bundleConfiguration
            .addClass("existing-configuration");

    var bundleConfigurationHeader = buildBundleConfigurationHeader(index, bundleData);
        bundleConfigurationHeader.appendTo(bundleConfiguration);

    return bundleConfiguration;
}

/**
 * >>>> The header of an existing configuration.
 */
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

/**
 * > The Configuration panel.
 */
function showConfigurationPanel(clickedButton, overlayCallback) {
    callMethod(
        "getConfigurationOptions",
        $(clickedButton).data(),
        function(response) {
            logger.dump("Get Configuration Options Response", response);

            // Create panel for configurations.
            var configurationPanel = buildConfigurationPanel(response, clickedButton);
                configurationPanel.appendTo(".container");

            // Add an overlay so it looks like the config panel is a modal.
            addOverlay(configurationPanel, function() {
                if (! _.isUndefined(overlayCallback)) {
                    overlayCallback();
                }
            });
        }
    );
}

/**
 * >> Build the config panel.
 */
function buildConfigurationPanel(configurationOptions, clickedButton) {
    logger.info("Entering building configuration Panel");
    logger.dump("Configuration options:", configurationOptions);
    logger.dump("Clicked buttion:", clickedButton);

    // Create panel.
    var configPanel = $("<div/>");
        configPanel.addClass("configPanel");

    // Add close button.
    var closeButton = buildConfigCloseButton();
        closeButton.appendTo(configPanel);

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

/**
 * >>> The close button.
 */
function buildConfigCloseButton() {
    var closeButton = $("<span/>");
        closeButton
            .addClass("btn-close")
            .on("click", function() {
                $("#overlay").trigger("click");
            });

    return closeButton;
}

/**
 * >>> Title.
 */
function buildConfigPanelTitle(configurationOptions) {
    // Create the title.
    var configTitle = $("<h2></h2>");
        configTitle
            .addClass("configTitle")
            .text(configurationOptions.information.OCD.Name);

    return configTitle;
}

/**
 * >>> Configuration options.
 */
function buildConfigOptions(configOptions) {
    // Create the config options container.
    var configOptionsContainer = $("<div/>");
        configOptionsContainer
            .addClass("configurationOptions")
            .attr("id", "configurationOptions");

    // Iterate over the options and create the appropiate input field.
    $.each(configOptions.information.ADs, function(index, attributeInformation) {
        logger.dump("Index: " + index + ", with attribute:", attributeInformation);

        var configOption = buildConfigOption(index, attributeInformation);
            configOption.appendTo(configOptionsContainer);
    });

    return configOptionsContainer;
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

/**
 * >>>> Option label.
 */
function buildOptionLabel(attributeInformation) {
    // Create option label.
    var optionLabel = $("<div/>");
        optionLabel
            .addClass("optionLabel")
            .text(attributeInformation.attribute.ad.name);

    return optionLabel;
}

/**
 * >>>> Input field.
 */
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

/**
 * >>> Save button.
 */
function buildConfigSaveButton(configurationOptions, clickedButton) {
    logger.dump("Configuration options when building config save button.", configurationOptions);

    // Create the button.
    var saveButton = $("<button>");
        saveButton
            .addClass("save-config-button button config-button btn-black btn-center");

    // Update or create?
    var responseMessage = "Widget successfully changed.";
    var method = "updateConfiguration";
    saveButton.text("Save changes");

    if ($(clickedButton).data("action") == "create") {
        saveButton.text("Create new");
        responseMessage = "Widget successfully created.";
        method = "createConfiguration";
    }

    // Set extra data about the bundle in the button.
    saveButton.attr("data-bundle-id", configurationOptions.information.id);
    saveButton.attr("data-location", configurationOptions.information.location);
    saveButton.attr("data-has-factory", $(clickedButton).data("has-factory"));

    saveButton.attr("data-has-fpid", $(clickedButton).data("has-fpid"));
    if ($(clickedButton).data("has-fpid")) {
        saveButton.attr("data-fpid", $(clickedButton).data("fpid"));
    }

    // Bind action to save button.
    $(saveButton).on("click", function() {
        var configData = getConfigurationOptionsData(this);

        // Update/create configuration.
        callMethod(method, [configData], function(response) {
            logger.dump("Create/change configuration response", response);
            $("#overlay").trigger("click");
            loadConfiguredComponents();
            showSuccessMessage({
                msg: responseMessage,
                timeout: 800
            });
        });
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
        else {
            logger.dump("Is text input.", field);
            configData[$(field).attr("name")] = $(field).val();
        }
    });

    logger.dump("Build config data object:", configData);

    return configData;
}

function storeDataInDataProperty(element, data) {
    // Store attribute information in data property.
    $.each(data, function(key, value) {
        $(element).attr("data-" + key.toDash(), value);
    });
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

function hasScrolled() {
    var st = $(this).scrollTop();

    // Make sure they scroll more than delta
    if(Math.abs(lastScrollTop - st) <= delta)
        return;

    // If they scrolled down and are past the navbar, add class .nav-up.
    // This is necessary so you never see what is "behind" the navbar.
    if (st > lastScrollTop && st > navbarHeight){
        // Scroll Down
        $('header').removeClass('nav-down').addClass('nav-up');
    } else {
        // Scroll Up
        if(st + $(window).height() < $(document).height()) {
            $('header').removeClass('nav-up').addClass('nav-down');
        }
    }

    lastScrollTop = st;
}

function showMessage(options) {
    var duration = 5000;
    if (! _.isUndefined(options.duration)) {
        duration = options.duration;
    }

    var timeout = 0;
    if (! _.isUndefined(options.timeout)) {
        timeout = options.timeout;
    }

    setTimeout(function() {
        $.floatingMessage(options.msg, {
            className : options.type + "Message",
            time : duration,
            show : "blind",
            hide : "blind",
            width : 600,
            stuffEasing : "swing",
            stuffEaseTime : 5000
        });
    }, timeout);
}

function showInfoMessage(options) {
    options.type = "info";
    return showMessage(options);
}

function showErrorMessage(options) {
    options.type = "error";
    return showMessage(options);
}

function showSuccessMessage(options) {
    options.type = "success";
    return showMessage(options);
}

function showWarningMessage(options) {
    optiont.type = "warning";
    return showMessage(options);
}

/**
 * > Helper functions.
 */

/**
 * >> General helpers.
 */
var callMethod = function(method, data, successCallback, errorCallback) {
    return $.ajax(method, {
        type: "POST",
        dataType: "json",
        data: JSON.stringify(data),
        success: successCallback
    }).error(function() {
        if (! _.isUndefined(errorCallback)) {
            return errorCallback();
        } else {
            showErrorMessage({
                msg : "Oops! Something went wrong. Please try again later.",
                timeout : 800
            });
        }
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

function reloadComponents() {
    var tempScrollPosition = $(window).scrollTop();

    loadConfigurableComponents();

    // Return to old scroll position.
    setTimeout(function() {
        $(window).scrollTop(tempScrollPosition);
    }, 100);
}

// >>> Extend the String prototype Object.
// From: http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
String.prototype.toDash = function() {
    return this.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
};

String.prototype.toCamel = function(){
    return this.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
};

/**
 * >> Template manipulation.
 */
function addToTemplate(parameters) {
    logger.dump("Adding to template with parameters.", parameters);
    if (_.isUndefined(parameters.values)) {
        parameters.values = new Object;
    }

    var template = $(parameters.templateClass).html();
        template = replaceValuesInContent(template, parameters.values);

    $(parameters.rootDomClass).append(template);

    logger.dump("Template without wrapper", template);
    logger.dump("Template with wrapper", $(template));

    return template;
}

/**
 * Replace values in content
 *
 * @param content string
 * @param values array
 * @return string
 */
function replaceValuesInContent(content, values) {
    $.each(values, function(index, value) {
        if(! (parseInt(index) >= 0)) {
            content = replaceValueInContent(content, index, value);
        }
    });

    return content;
}

function replaceValueInContent(content, search, value) {
    return content.replace(new RegExp('{#'+search+'#}' , 'g'), value);
}

function buildClearDiv() {
    var clearDiv = $("<div style=\"clear: both;\"/>");
    return clearDiv;
}

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

// > Document ready.
$(document).ready(function() {
    console.log('Configuration page.');

    // Hide the header when scrolling down and vice versa.
    // With thanks to: http://wicky.nillia.ms/headroom.js/
    $("header").headroom({
        "offset" : 100,
        "tolerance" : {
            "up" : 10,
            "down" : 10
        },
        "classes" : {
            "initial" : "animated",
            "pinned" : "slideDown",
            "unpinned" : "slideUp"
        }
    });

    loadConfiguredComponents();
});
