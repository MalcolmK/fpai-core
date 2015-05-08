// Global variables.
var urlConnectionManager = "/system/console/fpai-connection-manager/";
var logger = new Logger();
var endpoints;

function doAsync (timeout) {
    var deferredObject = $.Deferred();

    setTimeout(function () {
        deferredObject.resolve(timeout);
    }, timeout);

    return deferredObject.promise();
}

function doAsync2 () {
    var deferredObject = $.Deferred();

    setTimeout(function () { deferredObject.notify(1); }, 1000);
    setTimeout(function () { deferredObject.notify(5); }, 2000);
    setTimeout(function () { deferredObject.notify(10); }, 3000);
    setTimeout(function () { deferredObject.resolve(); }, 4000);

    return deferredObject.promise();
}

function getValue (id, key) {
    return $.ajax(urlConnectionManager + "getValue.json", {
        "type": "GET",
        "data": {
            id: id,
            key: key
        },
        "dataType": "json"
    });
}

function setValue (id, passedKey, value) {
    var data = {};
    data["id"] = id;
    data[passedKey] = value;

    return $.ajax(urlConnectionManager + "setValue.json", {
        "type": "POST",
        "data": data,
        "dataType": "json"
    });
}

function getEndpoints () {
    wipeScreen();
    $.get(urlConnectionManager + "getEndpoints.json",
        function (endpointsReceived) {
            endpoints = endpointsReceived;
            logger.dump("Endpoints", endpoints);

            var driverBox = buildDriverBox();
                driverBox.appendTo(".connection-space");

            var energyApps = getAllEnergyApps();
            for (var energyAppIndex = 0; energyAppIndex < energyApps.length; energyAppIndex += 1) {
                var energyAppBox = buildEnergyAppBox(energyApps[energyAppIndex]);
                    energyAppBox.appendTo(".connection-space");
            }

            var clearFix = buildClearDiv();
                clearFix.appendTo(".connection-space");
        }
    ).fail(function (jqXHR, textStatus, errorThrown) {
        console.log("error: " + textStatus + ": " + errorThrown);
    });
}

function buildClearDiv() {
    var clearDiv = $("<div/>");
        clearDiv.addClass("clearfix");
    return clearDiv;
}

function buildDriverBox () {
    // The box itself.
    var driverBox = $("<div/>");
        driverBox
            .addClass("endpoint-box")
            .addClass("driver-box")
            .droppable({
                accept: function (element) {
                    if (! $(element).closest(".driver-box").length) {
                        return true;
                    }
                    return false;
                },
                tolerance: "pointer",
                activate: function (event, ui) {
                    var locationPlaceholder = buildLocationPlaceholder();
                        locationPlaceholder.appendTo($(this).find(".driver-list"));
                },
                deactivate: function (event, ui) {
                    $(this).find(".driver-list .list-item-placeholder").remove();
                },
                drop: function (event, ui) {
                    var driver = getEndpointById(ui.draggable.data("id"));

                    disconnectDriverFromEnergyApp(driver);

                    // Refresh the page.
                    refresh();
                }
            });

    // Add a title.
    var driverBoxTitle = buildDriverBoxTitle();
        driverBoxTitle.appendTo(driverBox);

    var driverList = buildDriverList();
        driverList.appendTo(driverBox);

    return driverBox;
}

function disconnectDriverFromEnergyApp (driver) {
    var driver = driver;
    var manager = getManagerConnectedToDriver(driver);
    var energyApp = getEnergyAppConnectedToManager(manager);

    // Get the connection IDs
    var firstConnectionID = getConnectionID(driver, manager);
    var secondConnectionID = getConnectionID(manager, energyApp);

    // Disconnect all connections.
    disconnect(firstConnectionID);
    disconnect(secondConnectionID);
}

function disconnectMultiple (connectionIDList) {
    for (var i = 0; i < connectionIDList.length; i += 1) {
        disconnect(connectionIDList[i]);
    }
}

function buildLocationPlaceholder () {
    var placeholder = $("<div/>");
        placeholder
            .addClass("list-item-placeholder");

    return placeholder;
}

function buildDriverBoxTitle () {
    // Create the title.
    var driverBoxTitle = $("<h2></h2>");
        driverBoxTitle
            .addClass("box-title")
            .text("Apps");

    return driverBoxTitle;
}

function buildDriverList () {
    var driverList = $("<div/>");
        driverList
            .addClass("driver-list");

    var allDrivers = getAllDrivers();
    for (var driverIndex = 0; driverIndex < allDrivers.length; driverIndex += 1) {
        // Current driver.
        var driver = allDrivers[driverIndex];

        if (isDriverConnected(driver)) {
            continue;
        }

        var driverListItem = buildDriverListItem(driver);
            driverListItem.appendTo(driverList);
    }

    return driverList;
}

function buildDriverListItem (driver) {
    setValue(driver.data.id, "name", driver.data.name);

    var driverListItem = $("<div/>");
        driverListItem
            .addClass("list-item")
            .addClass("button")
            .addClass("btn-orange")
            .text(driver.data.name)
            .attr("data-id", driver.data.id)
            .draggable({
                revert: "invalid",
                stack: ".list-item"
            })
            .on("dblclick", function () {
                var customNamePanel = buildCustomNamePanel(driver);
                    customNamePanel.appendTo(".connection-space");

                addOverlay(customNamePanel, function () {
                    refresh();
                });
            });

    return driverListItem;
}

function isDriverConnected (driver) {
    // Get all edges.
    var edges = getAllEdges();

    for (var edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
        var edge = edges[edgeIndex];

        if (edge.classes != "isconnected") {
            continue;
        }

        var source = edge.data.source;
        var target = edge.data.target;

        for (var portIndex = 0; portIndex < driver.ports.length; portIndex += 1) {
            var port = driver.ports[portIndex];
            if (port.id == source || port.id == target) {
                return true;
            }
        }
    }

    return false;
}

function buildEnergyAppBox (energyApp) {
    var uniqueID = _.uniqueId("energy-app-box-");

    // The box itself.
    var energyAppBox = $("<div/>");
        energyAppBox
            .addClass("endpoint-box")
            .addClass("energy-app-box")
            .attr("id", "energy-app-box-" + uniqueID)
            .droppable({
                accept: function (element) {
                    if (! $(element).closest("#energy-app-box-" + uniqueID).length) {
                        return true;
                    }
                    return false;
                },
                tolerance: "pointer",
                activate: function (event, ui) {
                    var locationPlaceholder = buildLocationPlaceholder();
                        locationPlaceholder.appendTo($(this).find(".driver-list"));
                },
                deactivate: function (event, ui) {
                    $(this).find(".driver-list .list-item-placeholder").remove();
                },
                drop: function (event, ui) {
                    // Get driver based on it's data attribute.
                    var driver = getEndpointById(ui.draggable.data("id"));

                    // First, make sure the driver is not connected anymore.
                    disconnectDriverFromEnergyApp(driver);

                    setTimeout(function () {
                        if (! hasPossibleManagers(driver)) {
                            var noManagersPanel = buildNoManagersPanel(driver);
                                noManagersPanel.appendTo(".connection-space");

                            addOverlay(noManagersPanel, function () {
                                refresh();
                            });
                        } else {
                            if (hasMultipleManagers(driver)) {
                                var managerPanel = buildManagerPanel(driver, energyApp);
                                    managerPanel.appendTo(".connection-space");

                                // Add an overlay so it looks like the config panel is a modal.
                                addOverlay(managerPanel, function() {});
                            } else {
                                // Get manager.
                                var possibleManagers = getPossibleManagers(driver);
                                var manager = possibleManagers[0];

                                // Get connection IDs.
                                var firstConnectionID = manager.manager_edge.data.id;
                                var secondConnectionID = getConnectionID(manager, energyApp);

                                // Make connections.
                                connect(firstConnectionID);
                                connect(secondConnectionID);

                                // Refresh page.
                                refresh();
                                $("#overlay").trigger("click");
                            }
                        }
                    }, 200);
                }
            });

    var boxTitle = buildEnergyAppBoxTitle(energyApp);
        boxTitle.appendTo(energyAppBox);

    var boxDrivers = buildEnergyAppBoxDrivers(energyApp);
        boxDrivers.appendTo(energyAppBox);

    return energyAppBox;
}

function refresh (timeout) {
    var usedTimeout = 200;
    if (typeof timeout !== "undefined") {
        usedTimeout = timeout;
    }

    setTimeout(function () {
        getEndpoints();
    }, usedTimeout);
}

function getEndpointById (id) {
    var nodes = getAllNodes();
    for (var nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
        if (nodes[nodeIndex].data.id == id) {
            return nodes[nodeIndex];
        }
    }
    return null;
}

function buildEnergyAppBoxTitle (energyApp) {
    // Create the title.
    var boxTitle = $("<h2></h2>");
        boxTitle
            .addClass("box-title")
            .text(energyApp.data.name)
            .on("dblclick", function () {
                var customNamePanel = buildCustomNamePanel(energyApp);
                    customNamePanel.appendTo(".connection-space");

                addOverlay(customNamePanel, function () {
                    refresh();
                });
            });

    return boxTitle;
}

function buildEnergyAppBoxDrivers (energyApp) {
    var driverList = $("<div/>");
        driverList
            .addClass("driver-list")
            .attr("data-energy-app-id", energyApp.data.id);

    var drivers = getDriversConnectedToEnergyApp(energyApp);

    for (var driverIndex = 0; driverIndex < drivers.length; driverIndex += 1) {
        var driverItem = buildDriverListItem(drivers[driverIndex]);
            driverItem.appendTo(driverList);
    }

    return driverList;
}

function getDriversConnectedToEnergyApp (energyApp) {
    var drivers = [];

    var connectedManagers = getManagersConnectedToEnergyApp(energyApp);

    for (var managerIndex = 0; managerIndex < connectedManagers.length; managerIndex += 1) {
        // Get current manager.
        var manager = connectedManagers[managerIndex];

        var connectedDriver = getDriverConnectedToManager(manager);
        drivers.push(connectedDriver);
    }

    return drivers;
}

function getManagersConnectedToEnergyApp (energyApp) {
    var managers = [];

    // Get all edges.
    var edges = getEndpointConnectedEdges(energyApp);

    for (var edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
        // Get current edge.
        var edge = edges[edgeIndex];

        // Get connection id.
        var connectionID = edge.data.id;

        // Get possible manager.
        var otherNode = getOtherNodeOfConnection(connectionID, energyApp);

        if (isManager(otherNode)) {
            managers.push(otherNode);
        }
    }

    return managers;
}

function getDriverConnectedToManager (manager) {
    var edges = getEndpointConnectedEdges(manager);

    for (var edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
        // Get current edge.
        var edge = edges[edgeIndex];

        // Get connection id of edge.
        var connectionID = edge.data.id;

        // Get possible driver.
        var driver = getOtherNodeOfConnection(connectionID, manager);

        if (isDriver(driver)) {
            return driver;
        }
    }
    return null;
}

function getManagerConnectedToDriver (driver) {
    var edges = getEndpointConnectedEdges(driver);

    for (var edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
        // Get current edge.
        var edge = edges[edgeIndex];

        // Get connection id of edge.
        var connectionID = edge.data.id;

        // Get possible driver.
        var manager = getOtherNodeOfConnection(connectionID, driver);

        if (isManager(manager)) {
            return manager;
        }
    }
    return null;
}

function getEnergyAppConnectedToManager (manager) {
    var edges = getEndpointConnectedEdges(manager);

    for (var edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
        // Get current edge.
        var edge = edges[edgeIndex];

        // Get connection id of edge.
        var connectionID = edge.data.id;

        // Get possible driver.
        var energyApp = getOtherNodeOfConnection(connectionID, manager);

        if (isEnergyApp(energyApp)) {
            return energyApp;
        }
    }
    return null;
}

function getAllDrivers () {
    var drivers = [];
    var length = endpoints.length;
    for (var i = 0; i < length; i += 1) {
        if (! isDriver(endpoints[i])) {
            continue;
        }
        drivers.push(endpoints[i]);
    }

    return drivers;
}

function isDriver (endpoint) {
    if (endpoint.group != "nodes") {
        return false;
    }

    if (endpoint.ports.length != 1) {
        return false;
    }

    return true;
}

function isManager (endpoint) {
    if (endpoint.group != "nodes") {
        return false;
    }

    if (isDriver(endpoint)) {
        return false;
    }

    if (isEnergyApp(endpoint)) {
        return false;
    }

    return true;
}

function getPossibleManagers (endpoint) {
    var edges = getAllEdges();
    var nodes = getAllNodes();

    var parameters = {
        "endpoint": endpoint,
        "endpoints": endpoints,
        "edges": edges,
        "nodes": nodes,
        "edgesLength": edges.length,
        "nodesLength": nodes.length
    };

    parameters.possibleEdges = getEndpointEdges(parameters);

    var possibleManagers = [];
    var possibleEdgesLength = parameters.possibleEdges.length;

    for (var i = 0; i < possibleEdgesLength; i += 1) {
        var edge = parameters.possibleEdges[i];
        if (edge.classes == "unconnectable") {
            continue;
        }
        var node = getNodeFromEdge(edge, parameters);
        possibleManagers.push(node);
    }

    return possibleManagers;
}

function getEndpointConnectedEdges (endpoint) {
    var endpointEdges = [];

    if (endpoint === null) {
        return endpointEdges;
    }

    var ports = endpoint.ports;
    var edges = getAllConnectedEdges();

    for (var edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
        var edge = edges[edgeIndex];
        var source = edge.data.source;
        var target = edge.data.target;

        if (isEndpointEdge(edge, ports)) {
            endpointEdges.push(edge);
            continue;
        }
    }

    return endpointEdges;
}

function getEndpointEdges (parameters) {
    var possibleEdges = [];
    var ports = parameters.endpoint.ports;

    var edgesLength = parameters.edgesLength;

    for (var i = 0; i < edgesLength; i += 1) {
        // Declare variables.
        var edge = parameters.edges[i];
        var source = edge.data.source;
        var target = edge.data.target;

        if (isEndpointEdge(edge, ports)) {
            possibleEdges.push(edge);
            continue;
        }
    }

    return possibleEdges;
}

function isEndpointEdge (edge, ports) {
    var source = edge.data.source;
    var target = edge.data.target;

    for (var i = 0; i < ports.length; i += 1) {
        var port = ports[i];
        if (port.id === source || port.id === target) {
            return true;
        }
    }
    return false;
}

function getNodeFromEdge (edge, parameters) {
    var target = (parameters.endpoint.data.id == edge.data.target ? edge.data.source : edge.data.target);

    var target = edge.data.target;
    var source = edge.data.source;

    for (var i = 0; i < parameters.nodesLength; i += 1) {
        var node = parameters.nodes[i];
        var ports = node.ports;
        var portsLength = ports.length;

        for (var j = 0; j < portsLength; j += 1) {
            var port = ports[j];
            if (port.id === target && port.parent != parameters.endpoint.data.id) {
                node.manager_edge = edge;
                return node;
            }

            if (port.id === source && port.parent != parameters.endpoint.data.id) {
                node.manager_edge = edge;
                return node;
            }
        }
    }

    return null;
}

function getAllEdges () {
    var edges = [];
    var length = endpoints.length;
    for (var i = 0; i < length; i += 1) {
        if (endpoints[i].group != "edges") {
            continue;
        }
        edges.push(endpoints[i]);
    }

    return edges;
}

function getAllConnectedEdges () {
    var edges = [];
    for (var i = 0; i < endpoints.length; i += 1) {
        if (endpoints[i].group != "edges") {
            continue;
        }

        if (endpoints[i].classes != "isconnected") {
            continue;
        }

        edges.push(endpoints[i]);
    }

    return edges;
}

function getAllNodes () {
    var nodes = [];
    var length = endpoints.length;
    for (var i = 0; i < length; i += 1) {
        if (endpoints[i].group != "nodes") {
            continue;
        }
        nodes.push(endpoints[i]);
    }

    return nodes;
}

function getOtherNodeOfConnection (connectionID, leftNode) {
    // Get the corresponding edge from the connection.
    var edge = getEdgeFromConnection(connectionID);

    // Get all nodes.
    var nodes = getAllNodes();

    // Get both ports from the edge.
    var source = edge.data.source;
    var target = edge.data.target;

    for (var nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
        var node = nodes[nodeIndex];

        for (var portIndex = 0; portIndex < node.ports.length; portIndex += 1) {
            var port = node.ports[portIndex];

            if (port.id == source && port.parent != leftNode.data.id) {
                return node;
            }

            if (port.id == target && port.parent != leftNode.data.id) {
                return node;
            }
        }
    }

    return null;
}

function getEdgeFromConnection (connectionID) {
    // Get all edges.
    var edges = getAllEdges();

    for (var edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
        // Get current edge.
        var edge = edges[edgeIndex];

        if (edge.data.id == connectionID) {
            return edge;
        }
    }

    return null;
}

function hasPossibleManagers (driver) {
    var managersList = getPossibleManagers(driver);
    return managersList.length > 0;
}

function hasMultipleManagers (endpoint) {
    var managersList = getPossibleManagers(endpoint);
    return managersList.length > 1;
}

function buildCustomNamePanel (driver) {
    // Create the panel.
    var customNamePanel = $("<div/>");
        customNamePanel
            .addClass("customNamePanel");

    // Add close button.
    var closeButton = buildManagerPanelCloseButton();
        closeButton.appendTo(customNamePanel);

    $.when(getValue(driver.data.id, "name")).done(function (data) {
        logger.dump("Received value for building custom name panel: ", data);
        var customName;
        if (data[0].value == null) {
            customName = driver.data.name;
        } else {
            customName = data[0].value;
        }
        logger.dump("Received name: ", customName);

        // Add title.
        var managerPanelTitle = buildCustomNamePanelTitle(driver, customName);
            managerPanelTitle.appendTo(customNamePanel);

        // Add description.
        var customNameDescription = buildCustomNameDescription(driver, customName);
            customNameDescription.appendTo(customNamePanel);

        // The input box for the name.
        var customNameInputBox = buildCustomNamePanelInputBox(driver, customName);
            customNameInputBox.appendTo(customNamePanel);

        // The button to save the world.
        var saveButton = buildCustomNameSaveButton(driver, customNameInputBox);
            saveButton.appendTo(customNamePanel);
    });

    return customNamePanel;
}

function buildCustomNamePanelTitle (driver, customName) {
    // Create the title.
    var managerPanelTitle = $("<h2></h2>");
        managerPanelTitle
            .addClass("managerPanelTitle")
            .text("Change name for " + customName);

    return managerPanelTitle;
}

function buildCustomNameDescription (driver, customName) {
    var text = "It is possible to give your own name to an App. Fill in that name below and click <strong>\"Save\"</strong> to save the name.";

    var customNameDescription = $("<p/>");
        customNameDescription
            .addClass("custom-name-description")
            .html(text);

    return customNameDescription;
}

function buildCustomNamePanelInputBox (driver, customName) {
    var inputBox = $("<input/>");
        inputBox
            .attr("type", "text")
            .attr("name", "name")
            .addClass("inputbox")
            .attr("value", customName);

    return inputBox;
}

function buildCustomNameSaveButton (driver, customNameInputBox) {
    var saveButton = $("<button/>");
        saveButton
            .addClass("button")
            .addClass("btn-orange")
            .addClass("btn-center")
            .addClass("save-custom-name-button")
            .text("Save")
            .on("click", function () {
                $.when(
                    setValue(driver.data.id, "name", $(customNameInputBox).val())
                ).done(function (data) {
                    logger.dump("Received data from setting value: ", data);
                    closeOverlay();
                });
            });

    return saveButton;
}

function buildNoManagersPanel (driver) {
    // Create the panel.
    var managerPanel = $("<div/>");
        managerPanel
            .addClass("managerPanel");

    // Add close button.
    var closeButton = buildManagerPanelCloseButton();
        closeButton.appendTo(managerPanel);

    // Add title.
    var managerPanelTitle = buildManagerPanelTitle(driver);
        managerPanelTitle.appendTo(managerPanel);

    // Add the text.
    var managerPanelText = buildNoManagersPanelText(driver);
        managerPanelText.appendTo(managerPanel);

    return managerPanel;
}

function buildNoManagersPanelText (driver) {
    var textBlock = $("<p/>");
        textBlock
            .addClass("text-block")
            .text("Sorry, there are no managers available for the app " + driver.data.name + ".");

    return textBlock;
}

function buildManagerPanel (endpoint, energyApp) {
    var possibleManagers = getPossibleManagers(endpoint);

    // Create the panel.
    var managerPanel = $("<div/>");
        managerPanel
            .addClass("managerPanel");

    // Add close button.
    var closeButton = buildManagerPanelCloseButton();
        closeButton.appendTo(managerPanel);

    // Add title.
    var managerPanelTitle = buildManagerPanelTitle(endpoint);
        managerPanelTitle.appendTo(managerPanel);

    // Add the managers.
    var managerBlocks = buildManagerBlocks(possibleManagers, energyApp);
        managerBlocks.appendTo(managerPanel);

    return managerPanel;
}

function buildManagerPanelCloseButton () {
    var closeButton = $("<span/>");
        closeButton
            .addClass("btn-close")
            .on("click", function() {
                $("#overlay").trigger("click");
            });

    return closeButton;
}

function buildManagerPanelTitle (endpoint) {
    // Create the title.
    var managerPanelTitle = $("<h2></h2>");
        managerPanelTitle
            .addClass("managerPanelTitle")
            .text(endpoint.data.name + " managers");

    return managerPanelTitle;
}

function buildManagerBlocks (possibleManagers, energyApp) {
    // Create a container.
    var managerBlocksContainer = $("<div/>");
        managerBlocksContainer
            .addClass("managerBlocks")
            .attr("id", "managerBlocks");

    // Iterate over the possible managers and create the according blocks.
    $.each(possibleManagers, function (index, possibleManager) {
        var managerBlock = buildManagerBlock(possibleManager, energyApp);
            managerBlock.appendTo(managerBlocksContainer);
    });

    return managerBlocksContainer;
}

function buildManagerBlock (possibleManager, energyApp) {
    var endpoints = endpoints;
    var possibleManager = possibleManager;
    var energyApp = energyApp;
    var firstConnectionID = possibleManager.manager_edge.data.id;
    var secondConnectionID = getConnectionID(possibleManager, energyApp);

    var managerBlock = $("<div/>");
        managerBlock
            .addClass("button")
            .addClass("btn-orange")
            .addClass("manager-block-button")
            .text(possibleManager.data.name)
            .on("click", function () {
                connect(firstConnectionID);
                connect(secondConnectionID);
                refresh();
                $("#overlay").trigger("click");
            });

    return managerBlock;
}

/*
 * Determine wether there is a connection between two nodes.
 * If there is a connection, return the corresponding connection id.
 */
function getConnectionID (leftNode, rightNode) {
    var edges = getAllEdges();

    for (var edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
        // Get source and target.
        var source = edges[edgeIndex].data.source;
        var target = edges[edgeIndex].data.target;

        var sourceNode = getNodeFromPort(source);
        var targetNode = getNodeFromPort(target);

        // Matches left node?
        if (leftNode != sourceNode && leftNode != targetNode) {
            continue;
        }

        // Matches right node?
        if (rightNode != sourceNode && rightNode != targetNode) {
            continue;
        }

        return edges[edgeIndex].data.id;
    }

    return false;
}

function getNodeFromPort (port) {
    var nodes = getAllNodes();

    for (var nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
        // Get node.
        var node = nodes[nodeIndex];

        // Get throught all ports of the node.
        for (var portIndex = 0; portIndex < node.ports.length; portIndex += 1) {
            // Get the port.
            var nodePort = node.ports[portIndex];

            if (nodePort.id == port) {
                return node;
            }
        }
    }
    return null;
}

function getAllEnergyApps () {
    var allEnergyApps = [];
    var nodes = getAllNodes();

    for (var i = 0; i < nodes.length; i += 1) {
        var node = nodes[i];

        if (isEnergyApp(node)) {
            allEnergyApps.push(node);
        }
    }

    return allEnergyApps;
}

function isEnergyApp (node) {
    if (hasPort_Buffer(node)) {
        return true;
    }

    if (hasPort_Timeshifter(node)) {
        return true;
    }

    if (hasPort_Unconstrained(node)) {
        return true;
    }

    if (hasPort_Uncontrolled(node)) {
        return true;
    }

    return false;
}

function hasPort_Buffer (node) {
    for (var i = 0; i < node.ports.length; i += 1) {
        if (node.ports[i].name == "buffer") {
            return true;
        }
    }
    return false;
}

function hasPort_Timeshifter (node) {
    for (var i = 0; i < node.ports.length; i += 1) {
        if (node.ports[i].name == "timeshifter") {
            return true;
        }
    }
    return false;
}

function hasPort_Unconstrained (node) {
    for (var i = 0; i < node.ports.length; i += 1) {
        if (node.ports[i].name == "unconstrained") {
            return true;
        }
    }
    return false;
}

function hasPort_Uncontrolled (node) {
    for (var i = 0; i < node.ports.length; i += 1) {
        if (node.ports[i].name == "uncontrolled") {
            return true;
        }
    }
    return false;
}

function connect (connectionID) {
    logger.info("Connecting " + connectionID);
    $.post("/system/console/fpai-connection-manager/connect.json",
        {"id": connectionID},
        function (result) {
            logger.dump("Result: ", result);
            logger.info("Connection result: " + result.status);
        }
    ).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("error: " + textStatus + ": " + errorThrown);
    }).always(function () {
    });
}

function disconnect(selectedEdgeId) {
    console.log("Disconnecting " + selectedEdgeId);
    var postdata = {
        "id" : selectedEdgeId
    };
    $.post("/system/console/fpai-connection-manager/disconnect.json", postdata,
            function(result) {
                $("#status").text(result.status);
                $("#status").attr("class", result.class);
            }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("error: " + textStatus + ": " + errorThrown);
    }).always(function () {
    });
}

/**
 * > Helper functions.
 */

/**
 * >> General helpers.
 */
// Logger Object.
function Logger () {
    this.dump = function(msg, variable) {
        // Only variable is defined.
        if (typeof msg == 'undefined') {
            console.debug(JSON.parse(JSON.stringify(variable)));

        // Only the message is defined.
        } else if (typeof variable == 'undefined') {
            console.debug(msg);

        // Both the message and the variable are defined.
        } else {
            console.groupCollapsed(msg);
                console.debug(JSON.parse(JSON.stringify(variable)));
                console.groupEnd();
        }
    };

    this.info = function(msg, variable) {
        // Only variable is defined.
        if (typeof msg == 'undefined') {
            console.info(JSON.parse(JSON.stringify(variable)));

        // Only the message is defined.
        } else if (typeof variable == 'undefined') {
            console.info(msg);

        // Both the message and the variable are defined.
        } else {
            console.groupCollapsed(msg);
                console.info(JSON.parse(JSON.stringify(variable)));
                console.groupEnd();
        }
    };

    this.warn = function(msg, variable) {
        // Only variable is defined.
        if (typeof msg == 'undefined') {
            console.warn(JSON.parse(JSON.stringify(variable)));

        // Only the message is defined.
        } else if (typeof variable == 'undefined') {
            console.warn(msg);

        // Both the message and the variable are defined.
        } else {
            console.groupCollapsed(msg);
                console.warn(JSON.parse(JSON.stringify(variable)));
                console.groupEnd();
        }
    };
}

function wipeScreen() {
    logger.info("Wiping the screen.");
    $(".connection-space").empty();
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

function closeOverlay () {
    $("#overlay").trigger("click");
}

function hideOverlay(frontElement, callback) {
    $(frontElement).remove();
    $("#overlay").remove();

    callback();
}
