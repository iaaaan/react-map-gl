var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* global window, document, process */
import PropTypes from 'prop-types';

var isBrowser = !((typeof process === 'undefined' ? 'undefined' : _typeof(process)) === 'object' && String(process) === '[object process]' && !process.browser);

var mapboxgl = isBrowser ? require('mapbox-gl') : null;

function noop() {}

var propTypes = {
  // Creation parameters
  // container: PropTypes.DOMElement || String

  mapboxApiAccessToken: PropTypes.string, /** Mapbox API access token for Mapbox tiles/styles. */
  attributionControl: PropTypes.bool, /** Show attribution control or not. */
  preserveDrawingBuffer: PropTypes.bool, /** Useful when you want to export the canvas as a PNG. */
  onLoad: PropTypes.func, /** The onLoad callback for the map */
  onError: PropTypes.func, /** The onError callback for the map */
  reuseMaps: PropTypes.bool,
  transformRequest: PropTypes.func, /** The transformRequest callback for the map */

  mapStyle: PropTypes.string, /** The Mapbox style. A string url to a MapboxGL style */
  visible: PropTypes.bool, /** Whether the map is visible */

  // Map view state
  width: PropTypes.number.isRequired, /** The width of the map. */
  height: PropTypes.number.isRequired, /** The height of the map. */
  longitude: PropTypes.number.isRequired, /** The longitude of the center of the map. */
  latitude: PropTypes.number.isRequired, /** The latitude of the center of the map. */
  zoom: PropTypes.number.isRequired, /** The tile zoom level of the map. */
  bearing: PropTypes.number, /** Specify the bearing of the viewport */
  pitch: PropTypes.number, /** Specify the pitch of the viewport */

  // Note: Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
  altitude: PropTypes.number /** Altitude of the viewport camera. Default 1.5 "screen heights" */
};

var defaultProps = {
  mapboxApiAccessToken: getAccessToken(),
  preserveDrawingBuffer: false,
  attributionControl: true,
  preventStyleDiffing: false,
  onLoad: noop,
  onError: noop,
  reuseMaps: false,
  transformRequest: null,

  mapStyle: 'mapbox://styles/mapbox/light-v8',
  visible: true,

  bearing: 0,
  pitch: 0,
  altitude: 1.5
};

// Try to get access token from URL, env, local storage or config
export function getAccessToken() {
  var accessToken = null;

  if (typeof window !== 'undefined' && window.location) {
    var match = window.location.search.match(/access_token=([^&\/]*)/);
    accessToken = match && match[1];
  }

  if (!accessToken && typeof process !== 'undefined') {
    // Note: This depends on bundler plugins (e.g. webpack) inmporting environment correctly
    accessToken = accessToken || process.env.MapboxAccessToken || process.env.REACT_APP_MapboxAccessToken; // eslint-disable-line
  }

  return accessToken || null;
}

// Helper function to merge defaultProps and check prop types
function checkPropTypes(props) {
  var component = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'component';

  // TODO - check for production (unless done by prop types package?)
  if (props.debug) {
    PropTypes.checkPropTypes(propTypes, props, 'prop', component);
  }
}

// A small wrapper class for mapbox-gl
// - Provides a prop style interface (that can be trivially used by a React wrapper)
// - Makes sure mapbox doesn't crash under Node
// - Handles map reuse (to work around Mapbox resource leak issues)
// - Provides support for specifying tokens during development

var Mapbox = function () {
  _createClass(Mapbox, null, [{
    key: 'supported',
    value: function supported() {
      return mapboxgl && mapboxgl.supported();
    }
  }]);

  function Mapbox(props) {
    _classCallCheck(this, Mapbox);

    if (!mapboxgl) {
      throw new Error('Mapbox not supported');
    }

    this.props = {};
    this._initialize(props);
  }

  _createClass(Mapbox, [{
    key: 'finalize',
    value: function finalize() {
      if (!mapboxgl || !this._map) {
        return this;
      }

      this._destroy();
      return this;
    }
  }, {
    key: 'setProps',
    value: function setProps(props) {
      if (!mapboxgl || !this._map) {
        return this;
      }

      this._update(this.props, props);
      return this;
    }

    // Mapbox's map.resize() reads size from DOM, so DOM element must already be resized
    // In a system like React we must wait to read size until after render
    // (e.g. until "componentDidUpdate")

  }, {
    key: 'resize',
    value: function resize() {
      if (!mapboxgl || !this._map) {
        return this;
      }

      this._map.resize();
      return this;
    }

    // External apps can access map this way

  }, {
    key: 'getMap',
    value: function getMap() {
      return this._map;
    }

    // PRIVATE API

  }, {
    key: '_create',
    value: function _create(props) {
      // Reuse a saved map, if available
      if (props.reuseMaps && Mapbox.savedMap) {
        this._map = this.map = Mapbox.savedMap;
        Mapbox.savedMap = null;
        // TODO - need to call onload again, need to track with Promise?
        props.onLoad();
      } else {
        var mapOptions = {
          container: props.container || document.body,
          center: [props.longitude, props.latitude],
          zoom: props.zoom,
          pitch: props.pitch,
          bearing: props.bearing,
          style: props.mapStyle,
          interactive: false,
          attributionControl: props.attributionControl,
          preserveDrawingBuffer: props.preserveDrawingBuffer
        };
        // We don't want to pass a null or no-op transformRequest function.
        if (props.transformRequest) {
          mapOptions.transformRequest = props.transformRequest;
        }
        this._map = this.map = new mapboxgl.Map(mapOptions);
        // Attach optional onLoad function
        this.map.once('load', props.onLoad);
        this.map.on('error', props.onError);
      }

      return this;
    }
  }, {
    key: '_destroy',
    value: function _destroy() {
      if (!Mapbox.savedMap) {
        Mapbox.savedMap = this._map;
      } else {
        this._map.remove();
      }
    }
  }, {
    key: '_initialize',
    value: function _initialize(props) {
      props = Object.assign({}, defaultProps, props);
      checkPropTypes(props, 'Mapbox');

      // Make empty string pick up default prop
      this.accessToken = props.mapboxApiAccessToken || defaultProps.mapboxApiAccessToken;

      // Creation only props
      if (mapboxgl) {
        if (!this.accessToken) {
          mapboxgl.accessToken = 'no-token'; // Prevents mapbox from throwing
        } else {
          mapboxgl.accessToken = this.accessToken;
        }
      }

      this._create(props);

      // Disable outline style
      var canvas = this.map.getCanvas();
      if (canvas) {
        canvas.style.outline = 'none';
      }

      this._updateMapViewport({}, props);
      this._updateMapSize({}, props);

      this.props = props;
    }
  }, {
    key: '_update',
    value: function _update(oldProps, newProps) {
      newProps = Object.assign({}, this.props, newProps);
      checkPropTypes(newProps, 'Mapbox');

      this._updateMapViewport(oldProps, newProps);
      this._updateMapSize(oldProps, newProps);

      this.props = newProps;
    }
  }, {
    key: '_updateMapViewport',
    value: function _updateMapViewport(oldProps, newProps) {
      var viewportChanged = newProps.latitude !== oldProps.latitude || newProps.longitude !== oldProps.longitude || newProps.zoom !== oldProps.zoom || newProps.pitch !== oldProps.pitch || newProps.bearing !== oldProps.bearing || newProps.altitude !== oldProps.altitude;

      if (viewportChanged) {
        this._map.jumpTo({
          center: [newProps.longitude, newProps.latitude],
          zoom: newProps.zoom,
          bearing: newProps.bearing,
          pitch: newProps.pitch
        });

        // TODO - jumpTo doesn't handle altitude
        if (newProps.altitude !== oldProps.altitude) {
          this._map.transform.altitude = newProps.altitude;
        }
      }
    }

    // Note: needs to be called after render (e.g. in componentDidUpdate)

  }, {
    key: '_updateMapSize',
    value: function _updateMapSize(oldProps, newProps) {
      var sizeChanged = oldProps.width !== newProps.width || oldProps.height !== newProps.height;
      if (sizeChanged) {
        this._map.resize();
      }
    }
  }]);

  return Mapbox;
}();

export default Mapbox;


Mapbox.propTypes = propTypes;
Mapbox.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXBib3gvbWFwYm94LmpzIl0sIm5hbWVzIjpbIlByb3BUeXBlcyIsImlzQnJvd3NlciIsInByb2Nlc3MiLCJTdHJpbmciLCJicm93c2VyIiwibWFwYm94Z2wiLCJyZXF1aXJlIiwibm9vcCIsInByb3BUeXBlcyIsIm1hcGJveEFwaUFjY2Vzc1Rva2VuIiwic3RyaW5nIiwiYXR0cmlidXRpb25Db250cm9sIiwiYm9vbCIsInByZXNlcnZlRHJhd2luZ0J1ZmZlciIsIm9uTG9hZCIsImZ1bmMiLCJvbkVycm9yIiwicmV1c2VNYXBzIiwidHJhbnNmb3JtUmVxdWVzdCIsIm1hcFN0eWxlIiwidmlzaWJsZSIsIndpZHRoIiwibnVtYmVyIiwiaXNSZXF1aXJlZCIsImhlaWdodCIsImxvbmdpdHVkZSIsImxhdGl0dWRlIiwiem9vbSIsImJlYXJpbmciLCJwaXRjaCIsImFsdGl0dWRlIiwiZGVmYXVsdFByb3BzIiwiZ2V0QWNjZXNzVG9rZW4iLCJwcmV2ZW50U3R5bGVEaWZmaW5nIiwiYWNjZXNzVG9rZW4iLCJ3aW5kb3ciLCJsb2NhdGlvbiIsIm1hdGNoIiwic2VhcmNoIiwiZW52IiwiTWFwYm94QWNjZXNzVG9rZW4iLCJSRUFDVF9BUFBfTWFwYm94QWNjZXNzVG9rZW4iLCJjaGVja1Byb3BUeXBlcyIsInByb3BzIiwiY29tcG9uZW50IiwiZGVidWciLCJNYXBib3giLCJzdXBwb3J0ZWQiLCJFcnJvciIsIl9pbml0aWFsaXplIiwiX21hcCIsIl9kZXN0cm95IiwiX3VwZGF0ZSIsInJlc2l6ZSIsInNhdmVkTWFwIiwibWFwIiwibWFwT3B0aW9ucyIsImNvbnRhaW5lciIsImRvY3VtZW50IiwiYm9keSIsImNlbnRlciIsInN0eWxlIiwiaW50ZXJhY3RpdmUiLCJNYXAiLCJvbmNlIiwib24iLCJyZW1vdmUiLCJPYmplY3QiLCJhc3NpZ24iLCJfY3JlYXRlIiwiY2FudmFzIiwiZ2V0Q2FudmFzIiwib3V0bGluZSIsIl91cGRhdGVNYXBWaWV3cG9ydCIsIl91cGRhdGVNYXBTaXplIiwib2xkUHJvcHMiLCJuZXdQcm9wcyIsInZpZXdwb3J0Q2hhbmdlZCIsImp1bXBUbyIsInRyYW5zZm9ybSIsInNpemVDaGFuZ2VkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE9BQU9BLFNBQVAsTUFBc0IsWUFBdEI7O0FBRUEsSUFBTUMsWUFBWSxFQUNoQixRQUFPQyxPQUFQLHlDQUFPQSxPQUFQLE9BQW1CLFFBQW5CLElBQ0FDLE9BQU9ELE9BQVAsTUFBb0Isa0JBRHBCLElBRUEsQ0FBQ0EsUUFBUUUsT0FITyxDQUFsQjs7QUFNQSxJQUFNQyxXQUFXSixZQUFZSyxRQUFRLFdBQVIsQ0FBWixHQUFtQyxJQUFwRDs7QUFFQSxTQUFTQyxJQUFULEdBQWdCLENBQUU7O0FBRWxCLElBQU1DLFlBQVk7QUFDaEI7QUFDQTs7QUFFQUMsd0JBQXNCVCxVQUFVVSxNQUpoQixFQUl3QjtBQUN4Q0Msc0JBQW9CWCxVQUFVWSxJQUxkLEVBS29CO0FBQ3BDQyx5QkFBdUJiLFVBQVVZLElBTmpCLEVBTXVCO0FBQ3ZDRSxVQUFRZCxVQUFVZSxJQVBGLEVBT1E7QUFDeEJDLFdBQVNoQixVQUFVZSxJQVJILEVBUVM7QUFDekJFLGFBQVdqQixVQUFVWSxJQVRMO0FBVWhCTSxvQkFBa0JsQixVQUFVZSxJQVZaLEVBVWtCOztBQUVsQ0ksWUFBVW5CLFVBQVVVLE1BWkosRUFZWTtBQUM1QlUsV0FBU3BCLFVBQVVZLElBYkgsRUFhUzs7QUFFekI7QUFDQVMsU0FBT3JCLFVBQVVzQixNQUFWLENBQWlCQyxVQWhCUixFQWdCb0I7QUFDcENDLFVBQVF4QixVQUFVc0IsTUFBVixDQUFpQkMsVUFqQlQsRUFpQnFCO0FBQ3JDRSxhQUFXekIsVUFBVXNCLE1BQVYsQ0FBaUJDLFVBbEJaLEVBa0J3QjtBQUN4Q0csWUFBVTFCLFVBQVVzQixNQUFWLENB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IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG5cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLyogZ2xvYmFsIHdpbmRvdywgZG9jdW1lbnQsIHByb2Nlc3MgKi9cbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cbmNvbnN0IGlzQnJvd3NlciA9ICEoXG4gIHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJlxuICBTdHJpbmcocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJyAmJlxuICAhcHJvY2Vzcy5icm93c2VyXG4pO1xuXG5jb25zdCBtYXBib3hnbCA9IGlzQnJvd3NlciA/IHJlcXVpcmUoJ21hcGJveC1nbCcpIDogbnVsbDtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmNvbnN0IHByb3BUeXBlcyA9IHtcbiAgLy8gQ3JlYXRpb24gcGFyYW1ldGVyc1xuICAvLyBjb250YWluZXI6IFByb3BUeXBlcy5ET01FbGVtZW50IHx8IFN0cmluZ1xuXG4gIG1hcGJveEFwaUFjY2Vzc1Rva2VuOiBQcm9wVHlwZXMuc3RyaW5nLCAvKiogTWFwYm94IEFQSSBhY2Nlc3MgdG9rZW4gZm9yIE1hcGJveCB0aWxlcy9zdHlsZXMuICovXG4gIGF0dHJpYnV0aW9uQ29udHJvbDogUHJvcFR5cGVzLmJvb2wsIC8qKiBTaG93IGF0dHJpYnV0aW9uIGNvbnRyb2wgb3Igbm90LiAqL1xuICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IFByb3BUeXBlcy5ib29sLCAvKiogVXNlZnVsIHdoZW4geW91IHdhbnQgdG8gZXhwb3J0IHRoZSBjYW52YXMgYXMgYSBQTkcuICovXG4gIG9uTG9hZDogUHJvcFR5cGVzLmZ1bmMsIC8qKiBUaGUgb25Mb2FkIGNhbGxiYWNrIGZvciB0aGUgbWFwICovXG4gIG9uRXJyb3I6IFByb3BUeXBlcy5mdW5jLCAvKiogVGhlIG9uRXJyb3IgY2FsbGJhY2sgZm9yIHRoZSBtYXAgKi9cbiAgcmV1c2VNYXBzOiBQcm9wVHlwZXMuYm9vbCxcbiAgdHJhbnNmb3JtUmVxdWVzdDogUHJvcFR5cGVzLmZ1bmMsIC8qKiBUaGUgdHJhbnNmb3JtUmVxdWVzdCBjYWxsYmFjayBmb3IgdGhlIG1hcCAqL1xuXG4gIG1hcFN0eWxlOiBQcm9wVHlwZXMuc3RyaW5nLCAvKiogVGhlIE1hcGJveCBzdHlsZS4gQSBzdHJpbmcgdXJsIHRvIGEgTWFwYm94R0wgc3R5bGUgKi9cbiAgdmlzaWJsZTogUHJvcFR5cGVzLmJvb2wsIC8qKiBXaGV0aGVyIHRoZSBtYXAgaXMgdmlzaWJsZSAqL1xuXG4gIC8vIE1hcCB2aWV3IHN0YXRlXG4gIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgd2lkdGggb2YgdGhlIG1hcC4gKi9cbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgaGVpZ2h0IG9mIHRoZSBtYXAuICovXG4gIGxvbmdpdHVkZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLCAvKiogVGhlIGxvbmdpdHVkZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBtYXAuICovXG4gIGxhdGl0dWRlOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgbGF0aXR1ZGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgbWFwLiAqL1xuICB6b29tOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgdGlsZSB6b29tIGxldmVsIG9mIHRoZSBtYXAuICovXG4gIGJlYXJpbmc6IFByb3BUeXBlcy5udW1iZXIsIC8qKiBTcGVjaWZ5IHRoZSBiZWFyaW5nIG9mIHRoZSB2aWV3cG9ydCAqL1xuICBwaXRjaDogUHJvcFR5cGVzLm51bWJlciwgLyoqIFNwZWNpZnkgdGhlIHBpdGNoIG9mIHRoZSB2aWV3cG9ydCAqL1xuXG4gIC8vIE5vdGU6IE5vbi1wdWJsaWMgQVBJLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzExMzdcbiAgYWx0aXR1ZGU6IFByb3BUeXBlcy5udW1iZXIgLyoqIEFsdGl0dWRlIG9mIHRoZSB2aWV3cG9ydCBjYW1lcmEuIERlZmF1bHQgMS41IFwic2NyZWVuIGhlaWdodHNcIiAqL1xufTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICBtYXBib3hBcGlBY2Nlc3NUb2tlbjogZ2V0QWNjZXNzVG9rZW4oKSxcbiAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiBmYWxzZSxcbiAgYXR0cmlidXRpb25Db250cm9sOiB0cnVlLFxuICBwcmV2ZW50U3R5bGVEaWZmaW5nOiBmYWxzZSxcbiAgb25Mb2FkOiBub29wLFxuICBvbkVycm9yOiBub29wLFxuICByZXVzZU1hcHM6IGZhbHNlLFxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBudWxsLFxuXG4gIG1hcFN0eWxlOiAnbWFwYm94Oi8vc3R5bGVzL21hcGJveC9saWdodC12OCcsXG4gIHZpc2libGU6IHRydWUsXG5cbiAgYmVhcmluZzogMCxcbiAgcGl0Y2g6IDAsXG4gIGFsdGl0dWRlOiAxLjVcbn07XG5cbi8vIFRyeSB0byBnZXQgYWNjZXNzIHRva2VuIGZyb20gVVJMLCBlbnYsIGxvY2FsIHN0b3JhZ2Ugb3IgY29uZmlnXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWNjZXNzVG9rZW4oKSB7XG4gIGxldCBhY2Nlc3NUb2tlbiA9IG51bGw7XG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhdGlvbikge1xuICAgIGNvbnN0IG1hdGNoID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5tYXRjaCgvYWNjZXNzX3Rva2VuPShbXiZcXC9dKikvKTtcbiAgICBhY2Nlc3NUb2tlbiA9IG1hdGNoICYmIG1hdGNoWzFdO1xuICB9XG5cbiAgaWYgKCFhY2Nlc3NUb2tlbiAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBOb3RlOiBUaGlzIGRlcGVuZHMgb24gYnVuZGxlciBwbHVnaW5zIChlLmcuIHdlYnBhY2spIGlubXBvcnRpbmcgZW52aXJvbm1lbnQgY29ycmVjdGx5XG4gICAgYWNjZXNzVG9rZW4gPSBhY2Nlc3NUb2tlbiB8fCBwcm9jZXNzLmVudi5NYXBib3hBY2Nlc3NUb2tlbiB8fCBwcm9jZXNzLmVudi5SRUFDVF9BUFBfTWFwYm94QWNjZXNzVG9rZW47IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgfVxuXG4gIHJldHVybiBhY2Nlc3NUb2tlbiB8fCBudWxsO1xufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gbWVyZ2UgZGVmYXVsdFByb3BzIGFuZCBjaGVjayBwcm9wIHR5cGVzXG5mdW5jdGlvbiBjaGVja1Byb3BUeXBlcyhwcm9wcywgY29tcG9uZW50ID0gJ2NvbXBvbmVudCcpIHtcbiAgLy8gVE9ETyAtIGNoZWNrIGZvciBwcm9kdWN0aW9uICh1bmxlc3MgZG9uZSBieSBwcm9wIHR5cGVzIHBhY2thZ2U/KVxuICBpZiAocHJvcHMuZGVidWcpIHtcbiAgICBQcm9wVHlwZXMuY2hlY2tQcm9wVHlwZXMocHJvcFR5cGVzLCBwcm9wcywgJ3Byb3AnLCBjb21wb25lbnQpO1xuICB9XG59XG5cbi8vIEEgc21hbGwgd3JhcHBlciBjbGFzcyBmb3IgbWFwYm94LWdsXG4vLyAtIFByb3ZpZGVzIGEgcHJvcCBzdHlsZSBpbnRlcmZhY2UgKHRoYXQgY2FuIGJlIHRyaXZpYWxseSB1c2VkIGJ5IGEgUmVhY3Qgd3JhcHBlcilcbi8vIC0gTWFrZXMgc3VyZSBtYXBib3ggZG9lc24ndCBjcmFzaCB1bmRlciBOb2RlXG4vLyAtIEhhbmRsZXMgbWFwIHJldXNlICh0byB3b3JrIGFyb3VuZCBNYXBib3ggcmVzb3VyY2UgbGVhayBpc3N1ZXMpXG4vLyAtIFByb3ZpZGVzIHN1cHBvcnQgZm9yIHNwZWNpZnlpbmcgdG9rZW5zIGR1cmluZyBkZXZlbG9wbWVudFxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXBib3gge1xuICBzdGF0aWMgc3VwcG9ydGVkKCkge1xuICAgIHJldHVybiBtYXBib3hnbCAmJiBtYXBib3hnbC5zdXBwb3J0ZWQoKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgaWYgKCFtYXBib3hnbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNYXBib3ggbm90IHN1cHBvcnRlZCcpO1xuICAgIH1cblxuICAgIHRoaXMucHJvcHMgPSB7fTtcbiAgICB0aGlzLl9pbml0aWFsaXplKHByb3BzKTtcbiAgfVxuXG4gIGZpbmFsaXplKCkge1xuICAgIGlmICghbWFwYm94Z2wgfHwgIXRoaXMuX21hcCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5fZGVzdHJveSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0UHJvcHMocHJvcHMpIHtcbiAgICBpZiAoIW1hcGJveGdsIHx8ICF0aGlzLl9tYXApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZSh0aGlzLnByb3BzLCBwcm9wcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBNYXBib3gncyBtYXAucmVzaXplKCkgcmVhZHMgc2l6ZSBmcm9tIERPTSwgc28gRE9NIGVsZW1lbnQgbXVzdCBhbHJlYWR5IGJlIHJlc2l6ZWRcbiAgLy8gSW4gYSBzeXN0ZW0gbGlrZSBSZWFjdCB3ZSBtdXN0IHdhaXQgdG8gcmVhZCBzaXplIHVudGlsIGFmdGVyIHJlbmRlclxuICAvLyAoZS5nLiB1bnRpbCBcImNvbXBvbmVudERpZFVwZGF0ZVwiKVxuICByZXNpemUoKSB7XG4gICAgaWYgKCFtYXBib3hnbCB8fCAhdGhpcy5fbWFwKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLl9tYXAucmVzaXplKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBFeHRlcm5hbCBhcHBzIGNhbiBhY2Nlc3MgbWFwIHRoaXMgd2F5XG4gIGdldE1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwO1xuICB9XG5cbiAgLy8gUFJJVkFURSBBUElcblxuICBfY3JlYXRlKHByb3BzKSB7XG4gICAgLy8gUmV1c2UgYSBzYXZlZCBtYXAsIGlmIGF2YWlsYWJsZVxuICAgIGlmIChwcm9wcy5yZXVzZU1hcHMgJiYgTWFwYm94LnNhdmVkTWFwKSB7XG4gICAgICB0aGlzLl9tYXAgPSB0aGlzLm1hcCA9IE1hcGJveC5zYXZlZE1hcDtcbiAgICAgIE1hcGJveC5zYXZlZE1hcCA9IG51bGw7XG4gICAgICAvLyBUT0RPIC0gbmVlZCB0byBjYWxsIG9ubG9hZCBhZ2FpbiwgbmVlZCB0byB0cmFjayB3aXRoIFByb21pc2U/XG4gICAgICBwcm9wcy5vbkxvYWQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbWFwT3B0aW9ucyA9IHtcbiAgICAgICAgY29udGFpbmVyOiBwcm9wcy5jb250YWluZXIgfHwgZG9jdW1lbnQuYm9keSxcbiAgICAgICAgY2VudGVyOiBbcHJvcHMubG9uZ2l0dWRlLCBwcm9wcy5sYXRpdHVkZV0sXG4gICAgICAgIHpvb206IHByb3BzLnpvb20sXG4gICAgICAgIHBpdGNoOiBwcm9wcy5waXRjaCxcbiAgICAgICAgYmVhcmluZzogcHJvcHMuYmVhcmluZyxcbiAgICAgICAgc3R5bGU6IHByb3BzLm1hcFN0eWxlLFxuICAgICAgICBpbnRlcmFjdGl2ZTogZmFsc2UsXG4gICAgICAgIGF0dHJpYnV0aW9uQ29udHJvbDogcHJvcHMuYXR0cmlidXRpb25Db250cm9sLFxuICAgICAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHByb3BzLnByZXNlcnZlRHJhd2luZ0J1ZmZlclxuICAgICAgfTtcbiAgICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gcGFzcyBhIG51bGwgb3Igbm8tb3AgdHJhbnNmb3JtUmVxdWVzdCBmdW5jdGlvbi5cbiAgICAgIGlmIChwcm9wcy50cmFuc2Zvcm1SZXF1ZXN0KSB7XG4gICAgICAgIG1hcE9wdGlvbnMudHJhbnNmb3JtUmVxdWVzdCA9IHByb3BzLnRyYW5zZm9ybVJlcXVlc3Q7XG4gICAgICB9XG4gICAgICB0aGlzLl9tYXAgPSB0aGlzLm1hcCA9IG5ldyBtYXBib3hnbC5NYXAobWFwT3B0aW9ucyk7XG4gICAgICAvLyBBdHRhY2ggb3B0aW9uYWwgb25Mb2FkIGZ1bmN0aW9uXG4gICAgICB0aGlzLm1hcC5vbmNlKCdsb2FkJywgcHJvcHMub25Mb2FkKTtcbiAgICAgIHRoaXMubWFwLm9uKCdlcnJvcicsIHByb3BzLm9uRXJyb3IpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2Rlc3Ryb3koKSB7XG4gICAgaWYgKCFNYXBib3guc2F2ZWRNYXApIHtcbiAgICAgIE1hcGJveC5zYXZlZE1hcCA9IHRoaXMuX21hcDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbWFwLnJlbW92ZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9pbml0aWFsaXplKHByb3BzKSB7XG4gICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0UHJvcHMsIHByb3BzKTtcbiAgICBjaGVja1Byb3BUeXBlcyhwcm9wcywgJ01hcGJveCcpO1xuXG4gICAgLy8gTWFrZSBlbXB0eSBzdHJpbmcgcGljayB1cCBkZWZhdWx0IHByb3BcbiAgICB0aGlzLmFjY2Vzc1Rva2VuID0gcHJvcHMubWFwYm94QXBpQWNjZXNzVG9rZW4gfHwgZGVmYXVsdFByb3BzLm1hcGJveEFwaUFjY2Vzc1Rva2VuO1xuXG4gICAgLy8gQ3JlYXRpb24gb25seSBwcm9wc1xuICAgIGlmIChtYXBib3hnbCkge1xuICAgICAgaWYgKCF0aGlzLmFjY2Vzc1Rva2VuKSB7XG4gICAgICAgIG1hcGJveGdsLmFjY2Vzc1Rva2VuID0gJ25vLXRva2VuJzsgLy8gUHJldmVudHMgbWFwYm94IGZyb20gdGhyb3dpbmdcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcGJveGdsLmFjY2Vzc1Rva2VuID0gdGhpcy5hY2Nlc3NUb2tlbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9jcmVhdGUocHJvcHMpO1xuXG4gICAgLy8gRGlzYWJsZSBvdXRsaW5lIHN0eWxlXG4gICAgY29uc3QgY2FudmFzID0gdGhpcy5tYXAuZ2V0Q2FudmFzKCk7XG4gICAgaWYgKGNhbnZhcykge1xuICAgICAgY2FudmFzLnN0eWxlLm91dGxpbmUgPSAnbm9uZSc7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlTWFwVmlld3BvcnQoe30sIHByb3BzKTtcbiAgICB0aGlzLl91cGRhdGVNYXBTaXplKHt9LCBwcm9wcyk7XG5cbiAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gIH1cblxuICBfdXBkYXRlKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIG5ld1Byb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wcm9wcywgbmV3UHJvcHMpO1xuICAgIGNoZWNrUHJvcFR5cGVzKG5ld1Byb3BzLCAnTWFwYm94Jyk7XG5cbiAgICB0aGlzLl91cGRhdGVNYXBWaWV3cG9ydChvbGRQcm9wcywgbmV3UHJvcHMpO1xuICAgIHRoaXMuX3VwZGF0ZU1hcFNpemUob2xkUHJvcHMsIG5ld1Byb3BzKTtcblxuICAgIHRoaXMucHJvcHMgPSBuZXdQcm9wcztcbiAgfVxuXG4gIF91cGRhdGVNYXBWaWV3cG9ydChvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBjb25zdCB2aWV3cG9ydENoYW5nZWQgPVxuICAgICAgbmV3UHJvcHMubGF0aXR1ZGUgIT09IG9sZFByb3BzLmxhdGl0dWRlIHx8XG4gICAgICBuZXdQcm9wcy5sb25naXR1ZGUgIT09IG9sZFByb3BzLmxvbmdpdHVkZSB8fFxuICAgICAgbmV3UHJvcHMuem9vbSAhPT0gb2xkUHJvcHMuem9vbSB8fFxuICAgICAgbmV3UHJvcHMucGl0Y2ggIT09IG9sZFByb3BzLnBpdGNoIHx8XG4gICAgICBuZXdQcm9wcy5iZWFyaW5nICE9PSBvbGRQcm9wcy5iZWFyaW5nIHx8XG4gICAgICBuZXdQcm9wcy5hbHRpdHVkZSAhPT0gb2xkUHJvcHMuYWx0aXR1ZGU7XG5cbiAgICBpZiAodmlld3BvcnRDaGFuZ2VkKSB7XG4gICAgICB0aGlzLl9tYXAuanVtcFRvKHtcbiAgICAgICAgY2VudGVyOiBbbmV3UHJvcHMubG9uZ2l0dWRlLCBuZXdQcm9wcy5sYXRpdHVkZV0sXG4gICAgICAgIHpvb206IG5ld1Byb3BzLnpvb20sXG4gICAgICAgIGJlYXJpbmc6IG5ld1Byb3BzLmJlYXJpbmcsXG4gICAgICAgIHBpdGNoOiBuZXdQcm9wcy5waXRjaFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFRPRE8gLSBqdW1wVG8gZG9lc24ndCBoYW5kbGUgYWx0aXR1ZGVcbiAgICAgIGlmIChuZXdQcm9wcy5hbHRpdHVkZSAhPT0gb2xkUHJvcHMuYWx0aXR1ZGUpIHtcbiAgICAgICAgdGhpcy5fbWFwLnRyYW5zZm9ybS5hbHRpdHVkZSA9IG5ld1Byb3BzLmFsdGl0dWRlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIE5vdGU6IG5lZWRzIHRvIGJlIGNhbGxlZCBhZnRlciByZW5kZXIgKGUuZy4gaW4gY29tcG9uZW50RGlkVXBkYXRlKVxuICBfdXBkYXRlTWFwU2l6ZShvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBjb25zdCBzaXplQ2hhbmdlZCA9IG9sZFByb3BzLndpZHRoICE9PSBuZXdQcm9wcy53aWR0aCB8fCBvbGRQcm9wcy5oZWlnaHQgIT09IG5ld1Byb3BzLmhlaWdodDtcbiAgICBpZiAoc2l6ZUNoYW5nZWQpIHtcbiAgICAgIHRoaXMuX21hcC5yZXNpemUoKTtcbiAgICB9XG4gIH1cbn1cblxuTWFwYm94LnByb3BUeXBlcyA9IHByb3BUeXBlcztcbk1hcGJveC5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=