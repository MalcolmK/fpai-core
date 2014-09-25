cy = cytoscape({
	container : document.getElementById('cy'),
	selectionType : 'single', // (isTouchDevice ? 'additive' : 'single'),
	// layout: {
	// name: 'circle',
	// padding: 10
	// },
	layout : {
		name : 'cose',
		padding : 10
	},
	zoom : 1,
	minZoom : 0,
	maxZoom : 100,
	zoomingEnabled : true,
	userZoomingEnabled : false,
	pan : {
		x : 0,
		y : 0
	},
	panningEnabled : true,
	userPanningEnabled : false,
	autoungrabifyNodes : true,
	hideEdgesOnViewport : false,
	hideLabelsOnViewport : false,
	textureOnViewport : false,

	style : [ {
		selector : 'node',
		css : {
			'content' : 'data(name)',
			'font-family' : 'helvetica',
			'font-size' : 14,
			'text-outline-width' : 2,
			'text-outline-color' : '#000',
			'text-valign' : 'center',
			'color' : '#fff',
			'background-color' : '#0680C1',
			'border-color' : '#000'
		}
	}, {
		selector : ':selected',
		css : {
			'background-color' : '#222',
			'line-color' : '#222',
			'text-outline-width' : 3,
			'text-outline-color' : '#693'
		}
	}, {
		selector : ':parent',
		css : {
			'background-color' : '#041B50',
			'line-color' : '#000',
			'text-outline-color' : '#000'
		}
	}, {
		selector : 'edge',
		css : {
			'width' : 5,
			'target-arrow-shape' : 'none'

		}
	}, {
		selector : '.faded',
		css : {
			'opacity' : 0.9,
			'text-opacity' : 0.9
		}
	}, {
		selector : '.isconnected',
		css : {
			'width' : 6,
			'line-color' : '#0F0',
			'target-arrow-shape' : 'none'

		}
	} ],

	ready : function() {
		$("#cy div").css("z-index", "-1"); // fixes the menu
	}
});
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
refresh();

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

var selectedEdgeId;
function connect() {
	console.log("Connecting " + selectedEdgeId);
	var postdata = {
		"id" : selectedEdgeId
	};
	$.post("/system/console/fpai-connection-manager/connect.json", postdata,
			function(result) {
				$("#status").text(result.status);
				$("#status").attr("class", result.class);
			}).fail(function(jqXHR, textStatus, errorThrown) {
		console.log("error: " + textStatus + ": " + errorThrown);
	}).always(refresh());
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

cy.on('tap', 'node', function(e) {
	var node = e.cyTarget;
	var neighborhood = node.neighborhood().add(node);
	cy.elements().addClass('faded');
	neighborhood.removeClass('faded');

	$("#connect").prop("disabled", true);
	$("#disconnect").prop("disabled", true);

	onNodeSelected(node.id());
});

cy.on('tap', 'edge', function(e) {
	var edge = e.cyTarget;
	var neighborhood = edge.connectedNodes().add(edge);
	cy.elements().addClass('faded');
	neighborhood.removeClass('faded');

	onEdgeSelected(edge.id());
});

cy.on('tap', function(e) {
	if (e.cyTarget === cy) {
		cy.elements().removeClass('faded');
		onNothingSelected();
	}
});

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

	if (elem.data("isconnected")) {
		$("#connect").prop("disabled", true);
		$("#disconnect").prop("disabled", false);
	} else {
		$("#connect").prop("disabled", false);
		$("#disconnect").prop("disabled", true);
	}

	// console.log(elem.data());
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
