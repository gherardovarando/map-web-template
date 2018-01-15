require('leaflet');
require('leaflet-geometryutil');
//require('leaflet-draw');
window.Papa = require('papaparse');
require('leaflet-csvtiles');
require('leaflet-multilevel');
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
