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

    var managers = buildHeaderManagersColumn(endpoints);
        managers.appendTo(header);

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

function buildHeaderManagersColumn (endpoints) {
    var managers = $("<div/>");
        managers
            .addClass("managers")
            .text("Managers");

    return managers;
}

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

    var endpointManagers = buildEndpointManagers(endpoint, endpoints);
        endpointManagers.appendTo(endpointDiv);

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

    // @Todo.
    // Get the possible managers and show them.
    var possibleManagers = getPossibleManagers(endpoint, endpoints);
    logger.dump("Possible managers found:", possibleManagers);
    for (var i = 0; i < possibleManagers.length; i += 1) {
        if (possibleManagers[i].manager_edge.classes == "unconnectable") {
            continue;
        }

        var manager = buildManagerButton(possibleManagers[i], endpoint);
            manager.appendTo(managers);
    }
    return managers;
}

function hasPossibleManagers (endpoint, endpoints) {
    logger.dump("Check or endpoint has possible managers:", endpoint);
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
        logger.dump("Endpoint found in both source and target: ", parameters);
        return false;
    }

    if (!(isInSource || isInTarget)) {
        logger.dump("Endpoint found in nor source nor target: ", parameters);
        return false;
    }

    logger.dump("Endpoint found in source or in target: ", parameters);

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
            logger.dump("Port:", port);

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
        logger.dump("Edge:", edge);
        var target = edge.data.target;

        for (var k = 0; k < ports.length; k += 1) {
            var port = ports[k];
            logger.dump("Port:", port);

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
    logger.dump("Possible edges:", parameters.possibleEdges);

    var possibleManagers = [];
    var possibleEdgesLength = parameters.possibleEdges.length;

    for (var i = 0; i < possibleEdgesLength; i += 1) {
        var edge = parameters.possibleEdges[i];
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

    logger.dump("Getting node from edge: ", edge);
    logger.dump("Therefor using target: ", target);
    logger.dump("Extra passed parameters: ", parameters);

    for (var i = 0; i < parameters.nodesLength; i += 1) {
        var node = parameters.nodes[i];
        var ports = node.ports;
        var portsLength = ports.length;

        logger.dump("Evaluating node: ", node);

        for (var j = 0; j < portsLength; j += 1) {
            var port = ports[j];
            logger.dump("Evaluating port: ", port);
            if (port.id === target && port.parent != parameters.endpoint.data.id) {
                node.manager_edge = edge;
                logger.dump("Node found: ", node);
                return node;
            }

            if (port.id === source && port.parent != parameters.endpoint.data.id) {
                logger.dump("Manipulating node: ", node);
                logger.dump("Old manager edge: ", node.manager_edge);
                logger.dump("Replacing manager edge with following edge: ", edge);
                node.manager_edge = edge;
                logger.dump("Node found: ", node);
                return node;
            }
        }
    }

    return null;
}

function buildManagerButton (manager, endpoint) {
    logger.dump("Creating manager button with data:", manager);
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
                // alert("Connecting manager with driver...");
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

    possibleEnergyApps = getPossibleEnergyApps(endpoint, endpoints);
    for (var appIndex = 0; appIndex < possibleEnergyApps.length; appIndex += 1) {
        var energyApp = buildEnergyApp(possibleEnergyApps[appIndex]);
            energyApp.appendTo(energyApps);
    }

    return energyApps;
}

function buildEnergyApp (energyApp) {
    var buttonClass = (energyApp.manager_edge.classes == "isconnected" ? "is-connected" : "is-not-connected");
    var connectionID = energyApp.manager_edge.data.id;

    uniqueID = _.uniqueId("energy-app-");

    logger.dump("Building energy app with data: ", energyApp);

    var energyAppButton = $("<div/>");
        energyAppButton
            .attr("id", uniqueID)
            .addClass("energy-app")
            .addClass("button")
            .addClass(buttonClass)
            .attr("data-conntection-id", connectionID)
            .on("click", function () {
                alert("Connecting with connection id: " + connectionID);
                connect(connectionID);
            })
            .text(energyApp.data.name);


    return energyAppButton;
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

    logger.info("Getting possible energy apps.");

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

    // parameters.allEnergyApps = getAllEnergyApps(parameters.endpoints);

    // logger.dump("All energy apps: ", parameters.allEnergyApps);

    // for (var appIndex = 0; appIndex < parameters.allEnergyApps.length; appIndex += 1) {
    //     // Get energy app node.
    //     parameters.energyApp = parameters.allEnergyApps[appIndex];

    //     // Iterate over enery app ports.
    //     for (var portIndex = 0; portIndex < parameters.energyApp.ports; portIndex += 1) {
    //         // Get current port.
    //         parameters.energyAppPort = parameters.energyApp.ports[portIndex];

    //         // Check or the port is somehow linked to the endpoint.
    //         if (isEnergyPortLinkedToEndpoint(parameters)) {
    //             possibleEnergyApps.push(parameters.energyApp);
    //         }
    //     }
    // }

    return possibleEnergyApps;
}

/*
 * NOTE: Recursive function.
 */
function followConnectionsTillEnergyApp (parameters) {
    logger.dump("Following connection till energy app with parameters: ", parameters);
    var nextEndpoint = getNextEndpoint(parameters);

    if (nextEndpoint == null) {
        logger.info("Next endpoint is null");
        return null;
    }

    if (! isEnergyApp(nextEndpoint)) {
        parameters.previousEndpoint = parameters.endpoint;
        parameters.endpoint = nextEndpoint;
        logger.dump("Trying to get to a lower level with following parameters: ", parameters);
        return followConnectionsTillEnergyApp(parameters);
    }
    return nextEndpoint;
}

function getNextEndpoint (parameters) {
    logger.dump("Try to find next endpoint with parameters: ", parameters);

    var endpointEdges = getEndpointEdges(parameters);

    logger.dump("Endpoint edges: ", endpointEdges);

    // Looping over endpoint edges.
    for (var endpointEdgeIndex = 0; endpointEdgeIndex < endpointEdges.length; endpointEdgeIndex += 1) {
        var edge = endpointEdges[endpointEdgeIndex];
        logger.dump("Edge: ", edge);
        // This way the dots are not yet connected.
        if (edge.classes != "notconnected" && edge.classes != "isconnected") {
            logger.info("Edge class is not connected.");
            continue;
        } else {
            logger.info("Edge class is connected.");
        }

        var nextEndpoint = getNodeFromEdge(edge, parameters);
        logger.dump("Next endpoint: ", nextEndpoint);
        return nextEndpoint;
    }
    return null;
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
    }).always(getEndpoints());
}

function disconnect() {
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
    }).always(refresh());
}

// cy.on('tap', 'node', function(e) {
//  var node = e.cyTarget;
//  var neighborhood = node.neighborhood().add(node);
//  cy.elements().addClass('faded');
//  neighborhood.removeClass('faded');

//  $("#connect").prop("disabled", true);
//  $("#disconnect").prop("disabled", true);

//  onNodeSelected(node.id());
// });

// cy.on('tap', 'edge', function(e) {
//  var edge = e.cyTarget;
//  var neighborhood = edge.connectedNodes().add(edge);
//  cy.elements().addClass('faded');
//  neighborhood.removeClass('faded');

//  onEdgeSelected(edge.id());
// });

// cy.on('tap', function(e) {
//  if (e.cyTarget === cy) {
//      cy.elements().removeClass('faded');
//      onNothingSelected();
//  }
// });

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
