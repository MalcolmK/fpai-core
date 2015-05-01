// Global variables.
var urlConnectionManager = "/system/console/fpai-connection-manager/";
var logger = new Logger();

function getEndpoints () {
    wipeScreen();
    $.get(urlConnectionManager + "getEndpoints.json",
        function (endpoints) {
            logger.dump("Endpoints", endpoints);
            var endpointList = buildEndpointList(endpoints);
                endpointList.appendTo(".container");
        }
    ).fail(function (jqXHR, textStatus, errorThrown) {
        console.log("error: " + textStatus + ": " + errorThrown);
    });
}

function buildEndpointList (endpoints) {
    var endpointList = $("<div/>");
        endpointList
            .attr("id", "endpoint-list")
            .addClass("endpoint-list");

    var endpointListHeader = buildEndpointListHeader(endpoints);
        endpointListHeader.appendTo(endpointList);

    var endpointsDiv = $("<div/>");
        endpointsDiv
            .addClass("endpoints")
            .appendTo(endpointList);

    var length = endpoints.length;
    for (var i = 0; i < length; i += 1) {
        if (! isDriver(endpoints[i])) {
            continue;
        }

        var endpointDiv = buildEndpointDiv(endpoints[i], endpoints);
            endpointDiv.appendTo(endpointsDiv);
    }

    return endpointList;
}

function buildEndpointListHeader (endpoints) {
    var header = $("<div/>");
        header
            .addClass("endpoint-list-header");

    var nameColumn = buildHeaderNameColumn(endpoints);
        nameColumn.appendTo(header);

    // var managers = buildHeaderManagersColumn(endpoints);
    //     managers.appendTo(header);

    var energyApps = buildHeaderEnergyAppsColumn(endpoints);
        energyApps.appendTo(header);

    return header;
}

function buildHeaderNameColumn (endpoints) {
    var nameColumn = $("<div/>");
        nameColumn
            .addClass("name-column")
            .text("Apps");

    return nameColumn;
}

// function buildHeaderManagersColumn (endpoints) {
//     var managers = $("<div/>");
//         managers
//             .addClass("managers")
//             .text("Managers");

//     return managers;
// }

function buildHeaderEnergyAppsColumn (endpoints) {
    var energyApps = $("<div/>");
        energyApps
            .addClass("energy-apps")
            .text("Energy Apps");

    return energyApps;
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

function buildEndpointDiv (endpoint, endpoints) {

    endpoint.uniqueID = _.uniqueId("endpoint_");

    var endpointDiv = $("<div/>");
        endpointDiv
            .addClass("endpoint")
            .attr("id", endpoint.uniqueID);

    var endpointName = buildEndpointName(endpoint);
        endpointName.appendTo(endpointDiv);

    // var endpointManagers = buildEndpointManagers(endpoint, endpoints);
    //     endpointManagers.appendTo(endpointDiv);

    var endpointEnergyApps = buildEndpointEnergyApps(endpoint, endpoints);
        endpointEnergyApps.appendTo(endpointDiv);

    return endpointDiv;
}

function buildEndpointName (endpoint) {
    var endpointName = $("<div/>");
        endpointName
            .addClass("name-column")
            .text(endpoint.data.name);

    return endpointName;
}

function buildEndpointManagers (endpoint, endpoints) {
    // Create the managers div.
    var managers = $("<div/>");
        managers
            .addClass("managers");

    if (! hasPossibleManagers(endpoint, endpoints)) {
        managers.text("No possible managers found.");
        return managers;
    }

    var flagHasConnectedManager = false;
    var connectedManager = null;

    // Get the possible managers and show them.
    var possibleManagers = getPossibleManagers(endpoint, endpoints);
    for (var i = 0; i < possibleManagers.length; i += 1) {
        if (possibleManagers[i].manager_edge.classes == "isconnected") {
            flagHasConnectedManager = true;
            connectedManager = possibleManagers[i];
        }

        if (possibleManagers[i].manager_edge.classes == "unconnectable") {
            continue;
        }

        var manager = buildManagerButton(possibleManagers[i], endpoint);
            manager.appendTo(managers);
    }

    if (flagHasConnectedManager) {
        var disconnectManagerButton = buildDisconnectManagerButton(connectedManager);
            disconnectManagerButton.appendTo(managers);
    }

    return managers;
}

function buildDisconnectManagerButton (connectedManager) {
    connectionID = connectedManager.manager_edge.data.id;
    var button = $("<button/>");
        button
            .addClass("disconnect-manager")
            .on("click", function () {
                disconnect(connectionID);
            });

    return button;
}

function hasPossibleManagers (endpoint, endpoints) {
    var edges = getAllEdges(endpoints);
    var nodes = getAllNodes(endpoints);

    var parameters = {
        "endpoint": endpoint,
        "endpoints": endpoints,
        "edges": edges,
        "nodes": nodes,
        "edgesLength": edges.length,
        "nodesLength": nodes.length
    };

    var isInSource = isEndpointInSource(parameters);
    var isInTarget = isEndpointInTarget(parameters);

    if (isInSource && isInTarget) {
        return false;
    }

    if (!(isInSource || isInTarget)) {
        return false;
    }

    return true;
}

function isEndpointInSource (parameters) {
    var endpoint = parameters.endpoint;
    var edges = parameters.edges;
    var nodes = parameters.nodes;
    var ports = endpoint.ports;

    var edgesLength = parameters.edgesLength;
    var nodesLength = parameters.nodesLength;

    for (var i = 0; i < edgesLength; i += 1) {
        // Declare variables.
        var edge = edges[i];
        var source = edge.data.source;

        for (var k = 0; k < ports.length; k += 1) {
            var port = ports[k];

            if (port.id === source) {
                return true;
            }
        }
    }

    return false;
}

function isEndpointInTarget (parameters) {
    var endpoint = parameters.endpoint;
    var edges = parameters.edges;
    var nodes = parameters.nodes;
    var ports = endpoint.ports;

    var edgesLength = parameters.edgesLength;
    var nodesLength = parameters.nodesLength;

    for (var i = 0; i < edgesLength; i += 1) {
        // Declare variables.
        var edge = edges[i];
        var target = edge.data.target;

        for (var k = 0; k < ports.length; k += 1) {
            var port = ports[k];

            if (port.id === target) {
                return true;
            }
        }
    }
    return false;
}

function getPossibleManagers (endpoint, endpoints) {
    var edges = getAllEdges(endpoints);
    var nodes = getAllNodes(endpoints);

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

function buildManagerButton (manager, endpoint) {
    var buttonClass = (manager.manager_edge.classes == "isconnected" ? "is-connected" : "is-not-connected");
    var connectionID = manager.manager_edge.data.id;
    var managerButton = $("<button/>");
        managerButton
            .addClass("manager")
            .addClass("button")
            .addClass(buttonClass)
            .attr("data-connection-id", connectionID)
            .on("click", function () {
                connect(connectionID);
            })
            .text(manager.data.name);

    return managerButton;
}

function getAllEdges (endpoints) {
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

function getAllNodes (endpoints) {
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

function buildEndpointEnergyApps (endpoint, endpoints) {
    // Create the energy apps div.
    var energyApps = $("<div/>");
        energyApps
            .addClass("energy-apps");

    if (! hasPossibleEnergyApps(endpoint, endpoints)) {
        energyApps.text("No possible energy apps found.");
        return energyApps;
    }

    var flagHasConnectedEnergyApp = false;
    var connectedEnergyApp = null;

    possibleEnergyApps = getPossibleEnergyApps(endpoint, endpoints);
    for (var appIndex = 0; appIndex < possibleEnergyApps.length; appIndex += 1) {
        if (possibleEnergyApps[appIndex].manager_edge.classes == "isconnected") {
            flagHasConnectedEnergyApp = true;
            connectedEnergyApp = possibleEnergyApps[appIndex];
        }

        var energyApp = buildEnergyApp(endpoint, endpoints, possibleEnergyApps[appIndex]);
            energyApp.appendTo(energyApps);
    }

    if (flagHasConnectedEnergyApp) {
        var disconnectEnergyAppButton = buildDisconnectEnergyAppButton(endpoints, endpoint, connectedEnergyApp);
            disconnectEnergyAppButton.appendTo(energyApps);
    }

    return energyApps;
}

function buildDisconnectEnergyAppButton (endpoints, driver, energyApp) {
    var endpoints          = endpoints;
    var driver             = driver;
    var energyApp          = energyApp;
    var secondConnectionID = energyApp.manager_edge.data.id;
    logger.dump("Connection ID between manager and energyApp: ", secondConnectionID);
    var manager            = getOtherNodeOfConnection(endpoints, secondConnectionID, energyApp);
    var firstConnectionID  = getConnectionID(endpoints, driver, manager);

    logger.info("Building disconnect for energy app, with the following parameters:");
    logger.dump("Endpoints: ", endpoints);
    logger.dump("Driver: ", driver);
    logger.dump("Energy app: ", energyApp);

    var button = $("<button/>");
        button
            .addClass("disconnect-energy-app")
            .on("click", function () {
                logger.dump("Connection ID between manager and energyApp: ", secondConnectionID);
                logger.dump("Manager between driver and Energy App: ", manager);
                logger.dump("Connection ID between driver and manager: ", firstConnectionID);

                disconnect(secondConnectionID);
                disconnect(firstConnectionID);
                setTimeout(function () {
                    getEndpoints();
                }, 1000);
            });

    return button;
}

function getOtherNodeOfConnection (endpoints, connectionID, leftNode) {
    logger.info("Getting other node of connection, with following parameters:");
    logger.dump("Endpoints:", endpoints);
    logger.dump("Connection ID:", connectionID);
    logger.dump("Left node: ", leftNode);

    // Get the corresponding edge from the connection.
    var edge = getEdgeFromConnection(endpoints, connectionID);

    logger.dump("Corresponding edge from the connection: ", edge);

    // Get all nodes.
    var nodes = getAllNodes(endpoints);

    // Get both ports from the edge.
    var source = edge.data.source;
    var target = edge.data.target;

    logger.info("Using ports from edge: ");
    logger.dump("Source: ", source);
    logger.dump("Target: ", target);

    for (var nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
        var node = nodes[nodeIndex];
        logger.dump("Looping over nodes, evaluting node: ", node);

        for (var portIndex = 0; portIndex < node.ports.length; portIndex += 1) {
            var port = node.ports[portIndex];
            logger.dump("Evaluating port: ", port);

            if (port.id == source && port.parent != leftNode.data.id) {
                logger.dump("Node found: ", node);
                return node;
            }

            if (port.id == target && port.parent != leftNode.data.id) {
                logger.dump("Node found: ", node);
                return node;
            }
            logger.info("Node does not match.");
        }
    }
    logger.info("No node found.");

    return null;
}

function getEdgeFromConnection (endpoints, connectionID) {
    logger.info("Getting edge from connection, with following parameters:");
    logger.dump("Endpoints:", endpoints);
    logger.dump("Connection ID:", connectionID);

    // Get all edges.
    var edges = getAllEdges(endpoints);

    for (var edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
        // Get current edge.
        var edge = edges[edgeIndex];

        logger.dump("Evaluating edge:", edge);

        if (edge.data.id == connectionID) {
            logger.info("Edge found!");
            return edge;
        }
    }

    return null;
}

function buildEnergyApp (endpoint, endpoints, energyApp) {
    var buttonClass = (energyApp.manager_edge.classes == "isconnected" ? "is-connected" : "is-not-connected");
    var connectionID = energyApp.manager_edge.data.id;

    uniqueID = _.uniqueId("energy-app-");

    var energyAppButton = $("<div/>");
        energyAppButton
            .attr("id", uniqueID)
            .addClass("energy-app")
            .addClass("button")
            .addClass(buttonClass)
            .attr("data-conntection-id", connectionID)
            .on("click", function () {
                var managerPanel = buildManagerPanel(endpoint, endpoints, energyApp);
                    managerPanel.appendTo(".container");

                // Add an overlay so it looks like the config panel is a modal.
                addOverlay(managerPanel, function() {
                    if (typeof overlayCallback !== void 0) {
                        overlayCallback();
                    }
                });
            })
            .text(energyApp.data.name);

    return energyAppButton;
}

function buildManagerPanel (endpoint, endpoints, energyApp) {
    var possibleManagers = getPossibleManagers(endpoint, endpoints);

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
    var managerBlocks = buildManagerBlocks(endpoints, possibleManagers, energyApp);
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

function buildManagerBlocks (endpoints, possibleManagers, energyApp) {
    // Create a container.
    var managerBlocksContainer = $("<div/>");
        managerBlocksContainer
            .addClass("managerBlocks")
            .attr("id", "managerBlocks");

    // Iterate over the possible managers and create the according blocks.
    $.each(possibleManagers, function (index, possibleManager) {
        var managerBlock = buildManagerBlock(endpoints, possibleManager, energyApp);
            managerBlock.appendTo(managerBlocksContainer);
    });

    return managerBlocksContainer;
}

function buildManagerBlock (endpoints, possibleManager, energyApp) {
    var endpoints = endpoints;
    var possibleManager = possibleManager;
    var energyApp = energyApp;
    var firstConnectionID = possibleManager.manager_edge.data.id;
    var secondConnectionID = getConnectionID(endpoints, possibleManager, energyApp);

    var managerBlock = $("<div/>");
        managerBlock
            .addClass("button")
            .addClass("btn-orange")
            .addClass("manager-block-button")
            .text(possibleManager.data.name)
            .on("click", function () {
                logger.info("Connection ID of possible manager: " + firstConnectionID);
                connect(firstConnectionID);
                logger.info("Connection ID between manager and energy app: " + secondConnectionID);
                connect(secondConnectionID);
                setTimeout(function () {
                    getEndpoints();
                }, 1000);
                $("#overlay").trigger("click");
            });

    return managerBlock;
}

/*
 * Determine wether there is a connection between two nodes.
 * If there is a connection, return the corresponding connection id.
 */
function getConnectionID (endpoints, leftNode, rightNode) {
    logger.info("Getting connection ID, therefore using the following parameters:");
    logger.dump("Endpoints: ", endpoints);
    logger.dump("Left node: ", leftNode);
    logger.dump("Right node: ", rightNode);

    var edges = getAllEdges(endpoints);

    for (var edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
        // Get source and target.
        var source = edges[edgeIndex].data.source;
        var target = edges[edgeIndex].data.target;

        var sourceNode = getNodeFromPort(endpoints, source);
        var targetNode = getNodeFromPort(endpoints, target);

        // Matches left node?
        if (leftNode != sourceNode && leftNode != targetNode) {
            logger.info("Left node is not source and not target.");
            logger.dump("Left node: ", leftNode);
            logger.dump("Source node: ", sourceNode);
            logger.dump("Target node: ", targetNode);
            continue;
        }

        // Matches right node?
        if (rightNode != sourceNode && rightNode != targetNode) {
            logger.info("Right node is not source and not target.");
            logger.dump("Left node: ", rightNode);
            logger.dump("Source node: ", sourceNode);
            logger.dump("Target node: ", targetNode);
            continue;
        }

        return edges[edgeIndex].data.id;
    }

    return false;
}

function getNodeFromPort (endpoints, port) {
    var nodes = getAllNodes(endpoints);

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

function hasPossibleEnergyApps (endpoint, endpoints) {
    var energyApps = getPossibleEnergyApps(endpoint, endpoints);
    if (energyApps.length > 0) {
        return true;
    }
    return false;
}

function getPossibleEnergyApps (endpoint, endpoints) {
    // This function is returning just 1 energy app. It should be fixed.

    var possibleEnergyApps = [];

    // Getting all nodes and edges.
    var nodes = getAllNodes(endpoints);
    var edges = getAllEdges(endpoints);

    var parameters = {
        "endpoint": endpoint,
        "endpoints": endpoints,
        "nodes": nodes,
        "edges": edges,
        "nodesLength": nodes.length,
        "edgesLength": edges.length,
    };

    parameters.previousEndpoint = endpoint;
    var possibleEnergyApp = followConnectionsTillEnergyApp(parameters);
    if (possibleEnergyApp != null) {
        possibleEnergyApps.push(possibleEnergyApp);
    }

    return possibleEnergyApps;
}

/*
 * NOTE: Recursive function.
 */
function followConnectionsTillEnergyApp (parameters) {
    var nextEndpoint = getNextEndpoint(parameters);

    if (nextEndpoint == null) {
        return null;
    }

    if (! isEnergyApp(nextEndpoint)) {
        parameters.previousEndpoint = parameters.endpoint;
        parameters.endpoint = nextEndpoint;
        return followConnectionsTillEnergyApp(parameters);
    }
    return nextEndpoint;
}

function getNextEndpoint (parameters) {
    var endpointEdges = getEndpointEdges(parameters);

    // Looping over endpoint edges.
    for (var endpointEdgeIndex = 0; endpointEdgeIndex < endpointEdges.length; endpointEdgeIndex += 1) {
        var edge = endpointEdges[endpointEdgeIndex];
        // This way the dots are not yet connected.
        if (edge.classes != "notconnected" && edge.classes != "isconnected") {
            continue;
        } else {
        }

        var nextEndpoint = getNodeFromEdge(edge, parameters);
        return nextEndpoint;
    }
    return null;
}

function getNextEndpoints (parameters) {
    var nextEndpoints = [];
    var endpointEdges = getEndpointEdges(parameters);

    // Looping over endpoint edges.
    for (var endpointEdgeIndex = 0; endpointEdgeIndex < endpointEdges.length; endpointEdgeIndex += 1) {
        var edge = endpointEdges[endpointEdgeIndex];
        // This way the dots are not yet connected.
        if (edge.classes != "notconnected" && edge.classes != "isconnected") {
            continue;
        } else {
        }

        var nextEndpoint = getNodeFromEdge(edge, parameters);
        nextEndpoints.push(nextEndpoint);
    }
    return nextEndpoints;
}

function isEnergyPortLinkedToEndpoint (parameters) {
    // Add nodes and edges to parameters object.
    parameters.nodes = getAllNodes(parameters.endpoints);
    parameters.edges = getAllEdges(parameters.endpoints);

    // Go over all edges.
    for (var edgeIndex = 0; edgeIndex < parameters.edges.length; edgeIndex += 1) {
        // Get current edge.
        parameters.edge = parameters.edges[edgeIndex];

        // Get source and target.
        var source = parameters.edge.data.source;
        var target = parameters.edge.data.target;
    }
}

function getAllEnergyApps (endpoints) {
    var allEnergyApps = [];
    var nodes = getAllNodes(endpoints);

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

function refresh() {
    $.get("/system/console/fpai-connection-manager/getGraph.json",
            function(json) {
                console.log(json);
                cy.load(json);
                console.log("connected:");
                console.log(cy.edges("[isconnected]"));
            }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("error: " + textStatus + ": " + errorThrown);
    });
    $("#connect").prop("disabled", true);
    $("#disconnect").prop("disabled", true);
    selectedEdgeId = null;
}

function autoconnect() {
    console.log("Autoconnecting..");
    $.post("/system/console/fpai-connection-manager/autoconnect.json",
            function(result) {
                $("#status").text(result.status);
                $("#status").attr("class", result.class);
            }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("error: " + textStatus + ": " + errorThrown);
    });

    refresh();
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
        // setTimeout(function () {
            // getEndpoints();
        // }, 1000);
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
        // setTimeout(function () {
        //     getEndpoints();
        // }, 1000);
    });
}

function onNothingSelected() {
    selectedEdgeId = null;
    $(".infotable").text("");
    $("#1a").text("Nothing selected");
}

function onEdgeSelected(elemid) {
    selectedEdgeId = elemid;
    var elem = cy.$('#' + elemid); // select element
    $(".infotable").text("");
    $("#1a").text("Possible connection");
    $("#2a").text("connects: ");
    $("#2b").text(elem.data("source"));
    $("#3a").text("with: ");
    $("#3b").text(elem.data("target"));
    $("#4a").text("Connected: ");
    $("#4b").text(elem.data("isconnected"));
    $("#5a").text("elemid: ");
    $("#5b").text(elemid);

    if (elem.data("isconnected") || elem.data("unconnectable")) {
        $("#connect").prop("disabled", true);
        $("#disconnect").prop("disabled", false);
    } else {
        $("#connect").prop("disabled", false);
        $("#disconnect").prop("disabled", true);
    }
}

function onNodeSelected(elemid) {
    selectedEdgeId = null;
    var elem = cy.$('#' + elemid); // select element
    $(".infotable").text("");
    $("#1a").text("node");
    console.log(elem.data());
}

function updateInfo(elemid) {

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
    $(".container").empty();
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
