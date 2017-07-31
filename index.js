require('leaflet');
//require('leaflet-geometryutil');
require('leaflet-draw');
window.Papa = require('papaparse');
require('leaflet-csvtiles');
require('leaflet-multislice');
require('leaflet-snap');
require('leaflet-map-builder');


window.loadJSON =
  function loadJSON(path, cl) {
    let request = new XMLHttpRequest();
    request.overrideMimeType("application/json");
    request.onreadystatechange = function() {
      var DONE = this.DONE || 4;
      if (this.readyState === DONE) {
        cl(JSON.parse(this.responseText));
      }
    };
    request.open('GET', path, true);
    request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    request.send(null);
  }


window.options = {
  dev: true,
  controls: {
    draw: {
      position: 'bottomleft',
      draw: {
        polyline: false,
        marker: true,
        polygon: {
          allowIntersection: false,
          shapeOptions: {
            stroke: true,
            color: "#ed8414",
            weight: 4,
            opacity: 1,
            fill: true,
            fillColor: null, //same as color by default
            fillOpacity: 0.5,
            clickable: true
          }
        },
        rectangle: {
          shapeOptions: {
            stroke: true,
            color: "#ed8414",
            weight: 4,
            opacity: 1,
            fill: true,
            fillColor: null, //same as color by default
            fillOpacity: 0.5,
            clickable: true
          }
        },
        circle: false
      },
      edit: {
        allowIntersection: false
      }
    },
    zoom: true,
    layers: true
  },
  tooltip: {
    polygon: true,
    rectangle: true,
    marker: true
  },
  popup: {
    marker: true,
    polygon: true,
    rectangle: true
  }
}
