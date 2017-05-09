window.App = (function($, pannellum) {
	"use strict";

	var App = function(config) {
		this.config = config || {};
		this.config.mapSvgId = this.config.mapSvgId || 'mapsvg';
		this.config.panoramaConfig - this.config.panoramaConfig || 'tour.json';
		this.panoramaData = null;
		this.panoramaSceneId = null;
		this.onDocumentLoaded = this.onDocumentLoaded.bind(this);
	};
	App.run = function(config) {
		var app = new App(config);
		app.run();
	};
	App.prototype.run = function() {
		var self = this;
		$.getJSON(this.config.panoramaConfig, function(data) {
			self.panoramaData = data;
			self.panoramaSceneId = data.default.firstScene;
			$(document).ready(self.onDocumentLoaded);
		});
	};
	App.prototype.error = function() {
		console.error("Error: ", arguments);
	};
	App.prototype.onDocumentLoaded = function() {
		this.viewer = pannellum.viewer('panorama', this.panoramaData);
		this.listenForEvents();
	};
	App.prototype.listenForEvents = function() {
		var self = this;
		var viewer = this.viewer;
		var mapSvgId = this.config.mapSvgId;

		viewer.on('load', function() {
			console.log("Loaded pannellum.", viewer);
		});
		viewer.on('scenechange', function(sceneId) {
			self.panoramaSceneId = sceneId;
			self.updateSvg();
		});

		document.getElementById(mapSvgId).addEventListener("load", function() {
			self.svgDocument = this.getSVGDocument();
			console.log("SVG Loaded: ", self.svgDocument);
			console.dir(self.svgDocument);
			self.updateSvg();
		});
	};
	App.prototype.updateSvg = function() {
		var self = this;
		var scene = this.panoramaData.scenes[this.panoramaSceneId];
		var position;
		console.log("Map settings for scene ", this.panoramaSceneId, scene.map);
		if ('map' in scene) {
			position = scene.map.position.split(",");
			self.drawSvgMarker({ x: position[0], y: position[1] });
		} else {
			self.showSvgMarker(false);
		}
	};
	App.prototype.drawSvgMarker = function(params) {
		var svgDocument = this.svgDocument;
		var svg = svgDocument.documentElement;
		var svgNamespace = "http://www.w3.org/2000/svg";
		var shape;

		if(self.svgMarker) {
			shape = self.svgMarker;
			shape.setAttributeNS(null, "cx", params.x);
			shape.setAttributeNS(null, "cy", params.y);
		} else {
			shape = svgDocument.createElementNS(svgNamespace, "circle");
			shape.setAttributeNS(null, "cx", params.x);
			shape.setAttributeNS(null, "cy", params.y);
			shape.setAttributeNS(null, "r",  15);
			shape.setAttributeNS(null, "fill", "red");
			svg.appendChild(shape);
			self.svgMarker = shape;
        }
	};
	App.prototype.showSvgMarker = function(display) {
		if(self.svgMarker) {
			self.svgMarker.setAttributeNS(null, "display", display ? "" : "none");
		}
	};

	return App;
})(jQuery, pannellum);
