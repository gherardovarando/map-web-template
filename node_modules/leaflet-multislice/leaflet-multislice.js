// Copyright (c) 2017 Gherardo Varando
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

'use strict';
// leaflet required
if (L != undefined) {

  L.TileLayer.MultiSlice = L.TileLayer.extend({
    onAdd: function(map) {
      L.TileLayer.prototype.onAdd.call(this, map);
      map._layersMaxSlice.push(this.options.maxSlice);
      map._layersMinSlice.push(this.options.minSlice);
      map.on('slicechange', this.redraw, this);
      this.redraw();
    },

    onRemove: function(map) {
      L.TileLayer.prototype.onRemove.call(this, map);
      map._layersMaxSlice.splice(map._layersMaxSlice.indexOf(this.options.maxSlice), 1);
      map._layersMinSlice.splice(map._layersMaxSlice.indexOf(this.options.minSlice), 1);
      map.off('slicechange', this.redraw, this);
    },

    getTileUrl: function(coords) {
      var data = {
        r: L.Browser.retina ? '@2x' : '',
        s: this._getSubdomain(coords),
        x: coords.x,
        y: coords.y,
        z: this._getZoomForUrl(),
        slice: this._map._slice
      };
      if (this._map && !this._map.options.crs.infinite) {
        var invertedY = this._globalTileRange.max.y - coords.y;
        if (this.options.tms) {
          data['y'] = invertedY;
        }
        data['-y'] = invertedY;
      }
      return L.Util.template(this._url, L.extend(data, this.options));
    }
  });


  L.tileLayer.multiSlice = function(url, options) {
    return (new L.TileLayer.MultiSlice(url, options));
  };


  L.Control.Slice = L.Control.extend({
    onAdd: function(map) {
      var container = L.DomUtil.create('div', '');
      container.style.width = 'auto';
      container.style.height = 'auto';
      container.style.border = 'solid 0px black';
      container.style['border-radius'] = '4px';
      container.style.padding = '5px 5px 5px 5px';
      container.style['background-color'] = 'white';
      container.style['box-shadow'] = '0px 0px 4px black';
      var indicator = L.DomUtil.create('div', '', container);
      indicator.innerHTML = map._slice;
      indicator.style.width = 'auto';
      indicator.style.height = 'auto';
      indicator.style['font-size'] = '1.5em';
      indicator.style['font-weight'] = 'bold';
      indicator.style['line-height'] = '80%';
      indicator.style.cursor = 'default';

      indicator.title = 'Acutal slice';
      map.on('slicechange', this._update, this);
      this._indicator = indicator;
      return container;
    },

    onRemove: function(map) {
      map.off('slicechange', this._update, this);

    },

    _update: function() {
      this._indicator.innerHTML = this._map._slice;
    }
  });

  L.control.slice = function(opts) {
    return new L.Control.Slice(opts);
  }

  L.MultiSliceHandler = L.Handler.extend({

    addHooks: function() {
      L.DomEvent.on(window, 'keydown', this._keyDown, this);
      L.DomEvent.on(window, 'keyup', this._keyUp, this);
      this._map._slice = this._map.options.minSlice || 0;
      this._map._layersMaxSlice = [];
      this._map._layersMinSlice = [];
      if (this._map.options.sliceControl) {
        this._map.sliceControl = L.control.slice(this._map.options.sliceControl);
        this._map.addControl(this._map.sliceControl);
      }
    },

    removeHooks: function() {
      L.DomEvent.off(window, 'keydown', this._keyDown, this);
      L.DomEvent.off(window, 'keyup', this._keyUp, this);
      delete this._map._slice;
    },

    //ctrl plus arrow move between slices
    _keyDown: function(e) {
      if (!e.ctrlKey) return;
      if (e.keyCode == 38) {
        let max = this._map.options.maxSlice;
        if (typeof max === 'undefined') {
          max = Math.max(...this._map._layersMaxSlice);
        }
        if (max && this._map._slice >= max) return;
        this._map.fire('startslicechange');
      }
      if (e.keyCode == 40) {
        let min = this._map.options.minSlice;
        if (typeof min === 'undefined') {
          min = Math.min(...this._map._layersMinSlice);
        }
        if (min && this._map._slice <= min) return;
        this._map.fire('startslicechange');
      }
    },

    _keyUp: function(e) {
      if (!e.ctrlKey) return;
      if (e.keyCode == 38) {
        let max = this._map.options.maxSlice;
        if (typeof max === 'undefined') {
          max = Math.max(...this._map._layersMaxSlice);
        }
        if (max && this._map._slice >= max) return;
        this._map._slice++;
        this._map.fire('slicechange');
      }
      if (e.keyCode == 40) {
        let min = this._map.options.minSlice;
        if (typeof min === 'undefined') {
          min = Math.min(...this._map._layersMinSlice);
        }
        if (min && this._map._slice <= min) return;
        this._map._slice--;
        this._map.fire('slicechange');
      }
    }

  });


  L.Map.addInitHook('addHandler', 'multislice', L.MultiSliceHandler);

  L.Map.prototype.getSlice = function() {
    return this._slice;
  }

  L.Map.prototype.setSlice = function(slice) {
    if (this.options.multislice) {
      let max = this.options.maxSlice;
      if (typeof max === 'undefined') {
        max = Math.max(...this._layersMaxSlice);
      }
      let min = this.options.minSlice;
      if (typeof min === 'undefined') {
        min = Math.min(...this._layersMinSlice);
      }
      let s = Math.min(Math.max(slice, min), max);
      this._slice = s;
      this.fire("slicechange");
    }
    return this;
  }


  L.Map.prototype.setMaxSlice = function(max) {
    if (this.options.multislice) {
      this.options.maxSlice = max;
    }
    return this.setSlice(Math.min(this._slice, max));
  }


  L.Map.prototype.setMaxSlice = function(min) {
    if (this.options.multislice) {
      this.options.minSlice = min;
    }
    return this.setSlice(Math.max(this._slice, min));
  }
}
