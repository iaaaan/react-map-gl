'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.getAccessToken = getAccessToken;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isBrowser = !((typeof process === 'undefined' ? 'undefined' : (0, _typeof3.default)(process)) === 'object' && String(process) === '[object process]' && !process.browser); // Copyright (c) 2015 Uber Technologies, Inc.

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


var mapboxgl = isBrowser ? require('mapbox-gl') : null;

function noop() {}

var propTypes = {
  // Creation parameters
  // container: PropTypes.DOMElement || String

  mapboxApiAccessToken: _propTypes2.default.string, /** Mapbox API access token for Mapbox tiles/styles. */
  attributionControl: _propTypes2.default.bool, /** Show attribution control or not. */
  preserveDrawingBuffer: _propTypes2.default.bool, /** Useful when you want to export the canvas as a PNG. */
  onLoad: _propTypes2.default.func, /** The onLoad callback for the map */
  onError: _propTypes2.default.func, /** The onError callback for the map */
  reuseMaps: _propTypes2.default.bool,
  transformRequest: _propTypes2.default.func, /** The transformRequest callback for the map */

  mapStyle: _propTypes2.default.string, /** The Mapbox style. A string url to a MapboxGL style */
  visible: _propTypes2.default.bool, /** Whether the map is visible */

  // Map view state
  width: _propTypes2.default.number.isRequired, /** The width of the map. */
  height: _propTypes2.default.number.isRequired, /** The height of the map. */
  longitude: _propTypes2.default.number.isRequired, /** The longitude of the center of the map. */
  latitude: _propTypes2.default.number.isRequired, /** The latitude of the center of the map. */
  zoom: _propTypes2.default.number.isRequired, /** The tile zoom level of the map. */
  bearing: _propTypes2.default.number, /** Specify the bearing of the viewport */
  pitch: _propTypes2.default.number, /** Specify the pitch of the viewport */

  // Note: Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
  altitude: _propTypes2.default.number /** Altitude of the viewport camera. Default 1.5 "screen heights" */
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
function getAccessToken() {
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
    _propTypes2.default.checkPropTypes(propTypes, props, 'prop', component);
  }
}

// A small wrapper class for mapbox-gl
// - Provides a prop style interface (that can be trivially used by a React wrapper)
// - Makes sure mapbox doesn't crash under Node
// - Handles map reuse (to work around Mapbox resource leak issues)
// - Provides support for specifying tokens during development

var Mapbox = function () {
  (0, _createClass3.default)(Mapbox, null, [{
    key: 'supported',
    value: function supported() {
      return mapboxgl && mapboxgl.supported();
    }
  }]);

  function Mapbox(props) {
    (0, _classCallCheck3.default)(this, Mapbox);

    if (!mapboxgl) {
      throw new Error('Mapbox not supported');
    }

    this.props = {};
    this._initialize(props);
  }

  (0, _createClass3.default)(Mapbox, [{
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
      props = (0, _assign2.default)({}, defaultProps, props);
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
      newProps = (0, _assign2.default)({}, this.props, newProps);
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

exports.default = Mapbox;


Mapbox.propTypes = propTypes;
Mapbox.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXBib3gvbWFwYm94LmpzIl0sIm5hbWVzIjpbImdldEFjY2Vzc1Rva2VuIiwiaXNCcm93c2VyIiwicHJvY2VzcyIsIlN0cmluZyIsImJyb3dzZXIiLCJtYXBib3hnbCIsInJlcXVpcmUiLCJub29wIiwicHJvcFR5cGVzIiwibWFwYm94QXBpQWNjZXNzVG9rZW4iLCJzdHJpbmciLCJhdHRyaWJ1dGlvbkNvbnRyb2wiLCJib29sIiwicHJlc2VydmVEcmF3aW5nQnVmZmVyIiwib25Mb2FkIiwiZnVuYyIsIm9uRXJyb3IiLCJyZXVzZU1hcHMiLCJ0cmFuc2Zvcm1SZXF1ZXN0IiwibWFwU3R5bGUiLCJ2aXNpYmxlIiwid2lkdGgiLCJudW1iZXIiLCJpc1JlcXVpcmVkIiwiaGVpZ2h0IiwibG9uZ2l0dWRlIiwibGF0aXR1ZGUiLCJ6b29tIiwiYmVhcmluZyIsInBpdGNoIiwiYWx0aXR1ZGUiLCJkZWZhdWx0UHJvcHMiLCJwcmV2ZW50U3R5bGVEaWZmaW5nIiwiYWNjZXNzVG9rZW4iLCJ3aW5kb3ciLCJsb2NhdGlvbiIsIm1hdGNoIiwic2VhcmNoIiwiZW52IiwiTWFwYm94QWNjZXNzVG9rZW4iLCJSRUFDVF9BUFBfTWFwYm94QWNjZXNzVG9rZW4iLCJjaGVja1Byb3BUeXBlcyIsInByb3BzIiwiY29tcG9uZW50IiwiZGVidWciLCJNYXBib3giLCJzdXBwb3J0ZWQiLCJFcnJvciIsIl9pbml0aWFsaXplIiwiX21hcCIsIl9kZXN0cm95IiwiX3VwZGF0ZSIsInJlc2l6ZSIsInNhdmVkTWFwIiwibWFwIiwibWFwT3B0aW9ucyIsImNvbnRhaW5lciIsImRvY3VtZW50IiwiYm9keSIsImNlbnRlciIsInN0eWxlIiwiaW50ZXJhY3RpdmUiLCJNYXAiLCJvbmNlIiwib24iLCJyZW1vdmUiLCJfY3JlYXRlIiwiY2FudmFzIiwiZ2V0Q2FudmFzIiwib3V0bGluZSIsIl91cGRhdGVNYXBWaWV3cG9ydCIsIl91cGRhdGVNYXBTaXplIiwib2xkUHJvcHMiLCJuZXdQcm9wcyIsInZpZXdwb3J0Q2hhbmdlZCIsImp1bXBUbyIsInRyYW5zZm9ybSIsInNpemVDaGFuZ2VkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBZ0ZnQkEsYyxHQUFBQSxjOztBQTNEaEI7Ozs7OztBQUVBLElBQU1DLFlBQVksRUFDaEIsUUFBT0MsT0FBUCx1REFBT0EsT0FBUCxPQUFtQixRQUFuQixJQUNBQyxPQUFPRCxPQUFQLE1BQW9CLGtCQURwQixJQUVBLENBQUNBLFFBQVFFLE9BSE8sQ0FBbEIsQyxDQXZCQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBU0EsSUFBTUMsV0FBV0osWUFBWUssUUFBUSxXQUFSLENBQVosR0FBbUMsSUFBcEQ7O0FBRUEsU0FBU0MsSUFBVCxHQUFnQixDQUFFOztBQUVsQixJQUFNQyxZQUFZO0FBQ2hCO0FBQ0E7O0FBRUFDLHdCQUFzQixvQkFBVUMsTUFKaEIsRUFJd0I7QUFDeENDLHNCQUFvQixvQkFBVUMsSUFMZCxFQUtvQjtBQUNwQ0MseUJBQXVCLG9CQUFVRCxJQU5qQixFQU11QjtBQUN2Q0UsVUFBUSxvQkFBVUMsSUFQRixFQU9RO0FBQ3hCQyxXQUFTLG9CQUFVRCxJQVJILEVBUVM7QUFDekJFLGFBQVcsb0JBQVVMLElBVEw7QUFVaEJNLG9CQUFrQixvQkFBVUgsSUFWWixFQVVrQjs7QUFFbENJLFlBQVUsb0JBQVVULE1BWkosRUFZWTtBQUM1QlUsV0FBUyxvQkFBVVIsSUFiSCxFQWFTOztBQUV6QjtBQUNBUyxTQUFPLG9CQUFVQyxNQUFWLENBQWlCQyxVQWhCUixFQWdCb0I7QUFDcENDLFVBQVEsb0JBQVVGLE1BQVYsQ0FBaUJDLFVBakJULEVBaUJxQjtBQUNyQ0UsYUFBVyxvQkFBVUgsTUFBVixDQUFpQkMsVUFsQlosRUFrQndCO0FBQ3hDRyxZQUFVLG9CQUFVSixNQUFWLENBQWlCQyxVQW5CWCxFQW1CdUI7QUFD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S0FBdUIrQyxTQUFTL0MsU0FEaEMsSUFFQWdELFNBQVM5QyxJQUFULEtBQWtCNkMsU0FBUzdDLElBRjNCLElBR0E4QyxTQUFTNUMsS0FBVCxLQUFtQjJDLFNBQVMzQyxLQUg1QixJQUlBNEMsU0FBUzdDLE9BQVQsS0FBcUI0QyxTQUFTNUMsT0FKOUIsSUFLQTZDLFNBQVMzQyxRQUFULEtBQXNCMEMsU0FBUzFDLFFBTmpDOztBQVFBLFVBQUk0QyxlQUFKLEVBQXFCO0FBQ25CLGFBQUt6QixJQUFMLENBQVUwQixNQUFWLENBQWlCO0FBQ2ZoQixrQkFBUSxDQUFDYyxTQUFTaEQsU0FBVixFQUFxQmdELFNBQVMvQyxRQUE5QixDQURPO0FBRWZDLGdCQUFNOEMsU0FBUzlDLElBRkE7QUFHZkMsbUJBQVM2QyxTQUFTN0MsT0FISDtBQUlmQyxpQkFBTzRDLFNBQVM1QztBQUpELFNBQWpCOztBQU9BO0FBQ0EsWUFBSTRDLFNBQVMzQyxRQUFULEtBQXNCMEMsU0FBUzFDLFFBQW5DLEVBQTZDO0FBQzNDLGVBQUttQixJQUFMLENBQVUyQixTQUFWLENBQW9COUMsUUFBcEIsR0FBK0IyQyxTQUFTM0MsUUFBeEM7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7Ozs7bUNBQ2UwQyxRLEVBQVVDLFEsRUFBVTtBQUNqQyxVQUFNSSxjQUFjTCxTQUFTbkQsS0FBVCxLQUFtQm9ELFNBQVNwRCxLQUE1QixJQUFxQ21ELFNBQVNoRCxNQUFULEtBQW9CaUQsU0FBU2pELE1BQXRGO0FBQ0EsVUFBSXFELFdBQUosRUFBaUI7QUFDZixhQUFLNUIsSUFBTCxDQUFVRyxNQUFWO0FBQ0Q7QUFDRjs7Ozs7a0JBaktrQlAsTTs7O0FBb0tyQkEsT0FBT3JDLFNBQVAsR0FBbUJBLFNBQW5CO0FBQ0FxQyxPQUFPZCxZQUFQLEdBQXNCQSxZQUF0QiIsImZpbGUiOiJtYXBib3guanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cblxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vKiBnbG9iYWwgd2luZG93LCBkb2N1bWVudCwgcHJvY2VzcyAqL1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcblxuY29uc3QgaXNCcm93c2VyID0gIShcbiAgdHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmXG4gIFN0cmluZyhwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nICYmXG4gICFwcm9jZXNzLmJyb3dzZXJcbik7XG5cbmNvbnN0IG1hcGJveGdsID0gaXNCcm93c2VyID8gcmVxdWlyZSgnbWFwYm94LWdsJykgOiBudWxsO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuY29uc3QgcHJvcFR5cGVzID0ge1xuICAvLyBDcmVhdGlvbiBwYXJhbWV0ZXJzXG4gIC8vIGNvbnRhaW5lcjogUHJvcFR5cGVzLkRPTUVsZW1lbnQgfHwgU3RyaW5nXG5cbiAgbWFwYm94QXBpQWNjZXNzVG9rZW46IFByb3BUeXBlcy5zdHJpbmcsIC8qKiBNYXBib3ggQVBJIGFjY2VzcyB0b2tlbiBmb3IgTWFwYm94IHRpbGVzL3N0eWxlcy4gKi9cbiAgYXR0cmlidXRpb25Db250cm9sOiBQcm9wVHlwZXMuYm9vbCwgLyoqIFNob3cgYXR0cmlidXRpb24gY29udHJvbCBvciBub3QuICovXG4gIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogUHJvcFR5cGVzLmJvb2wsIC8qKiBVc2VmdWwgd2hlbiB5b3Ugd2FudCB0byBleHBvcnQgdGhlIGNhbnZhcyBhcyBhIFBORy4gKi9cbiAgb25Mb2FkOiBQcm9wVHlwZXMuZnVuYywgLyoqIFRoZSBvbkxvYWQgY2FsbGJhY2sgZm9yIHRoZSBtYXAgKi9cbiAgb25FcnJvcjogUHJvcFR5cGVzLmZ1bmMsIC8qKiBUaGUgb25FcnJvciBjYWxsYmFjayBmb3IgdGhlIG1hcCAqL1xuICByZXVzZU1hcHM6IFByb3BUeXBlcy5ib29sLFxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBQcm9wVHlwZXMuZnVuYywgLyoqIFRoZSB0cmFuc2Zvcm1SZXF1ZXN0IGNhbGxiYWNrIGZvciB0aGUgbWFwICovXG5cbiAgbWFwU3R5bGU6IFByb3BUeXBlcy5zdHJpbmcsIC8qKiBUaGUgTWFwYm94IHN0eWxlLiBBIHN0cmluZyB1cmwgdG8gYSBNYXBib3hHTCBzdHlsZSAqL1xuICB2aXNpYmxlOiBQcm9wVHlwZXMuYm9vbCwgLyoqIFdoZXRoZXIgdGhlIG1hcCBpcyB2aXNpYmxlICovXG5cbiAgLy8gTWFwIHZpZXcgc3RhdGVcbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCwgLyoqIFRoZSB3aWR0aCBvZiB0aGUgbWFwLiAqL1xuICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCwgLyoqIFRoZSBoZWlnaHQgb2YgdGhlIG1hcC4gKi9cbiAgbG9uZ2l0dWRlOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgbG9uZ2l0dWRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIG1hcC4gKi9cbiAgbGF0aXR1ZGU6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCwgLyoqIFRoZSBsYXRpdHVkZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBtYXAuICovXG4gIHpvb206IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCwgLyoqIFRoZSB0aWxlIHpvb20gbGV2ZWwgb2YgdGhlIG1hcC4gKi9cbiAgYmVhcmluZzogUHJvcFR5cGVzLm51bWJlciwgLyoqIFNwZWNpZnkgdGhlIGJlYXJpbmcgb2YgdGhlIHZpZXdwb3J0ICovXG4gIHBpdGNoOiBQcm9wVHlwZXMubnVtYmVyLCAvKiogU3BlY2lmeSB0aGUgcGl0Y2ggb2YgdGhlIHZpZXdwb3J0ICovXG5cbiAgLy8gTm90ZTogTm9uLXB1YmxpYyBBUEksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvMTEzN1xuICBhbHRpdHVkZTogUHJvcFR5cGVzLm51bWJlciAvKiogQWx0aXR1ZGUgb2YgdGhlIHZpZXdwb3J0IGNhbWVyYS4gRGVmYXVsdCAxLjUgXCJzY3JlZW4gaGVpZ2h0c1wiICovXG59O1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIG1hcGJveEFwaUFjY2Vzc1Rva2VuOiBnZXRBY2Nlc3NUb2tlbigpLFxuICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IGZhbHNlLFxuICBhdHRyaWJ1dGlvbkNvbnRyb2w6IHRydWUsXG4gIHByZXZlbnRTdHlsZURpZmZpbmc6IGZhbHNlLFxuICBvbkxvYWQ6IG5vb3AsXG4gIG9uRXJyb3I6IG5vb3AsXG4gIHJldXNlTWFwczogZmFsc2UsXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IG51bGwsXG5cbiAgbWFwU3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWFwYm94L2xpZ2h0LXY4JyxcbiAgdmlzaWJsZTogdHJ1ZSxcblxuICBiZWFyaW5nOiAwLFxuICBwaXRjaDogMCxcbiAgYWx0aXR1ZGU6IDEuNVxufTtcblxuLy8gVHJ5IHRvIGdldCBhY2Nlc3MgdG9rZW4gZnJvbSBVUkwsIGVudiwgbG9jYWwgc3RvcmFnZSBvciBjb25maWdcbmV4cG9ydCBmdW5jdGlvbiBnZXRBY2Nlc3NUb2tlbigpIHtcbiAgbGV0IGFjY2Vzc1Rva2VuID0gbnVsbDtcblxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmxvY2F0aW9uKSB7XG4gICAgY29uc3QgbWF0Y2ggPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLm1hdGNoKC9hY2Nlc3NfdG9rZW49KFteJlxcL10qKS8pO1xuICAgIGFjY2Vzc1Rva2VuID0gbWF0Y2ggJiYgbWF0Y2hbMV07XG4gIH1cblxuICBpZiAoIWFjY2Vzc1Rva2VuICYmIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIE5vdGU6IFRoaXMgZGVwZW5kcyBvbiBidW5kbGVyIHBsdWdpbnMgKGUuZy4gd2VicGFjaykgaW5tcG9ydGluZyBlbnZpcm9ubWVudCBjb3JyZWN0bHlcbiAgICBhY2Nlc3NUb2tlbiA9IGFjY2Vzc1Rva2VuIHx8IHByb2Nlc3MuZW52Lk1hcGJveEFjY2Vzc1Rva2VuIHx8IHByb2Nlc3MuZW52LlJFQUNUX0FQUF9NYXBib3hBY2Nlc3NUb2tlbjsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICB9XG5cbiAgcmV0dXJuIGFjY2Vzc1Rva2VuIHx8IG51bGw7XG59XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBtZXJnZSBkZWZhdWx0UHJvcHMgYW5kIGNoZWNrIHByb3AgdHlwZXNcbmZ1bmN0aW9uIGNoZWNrUHJvcFR5cGVzKHByb3BzLCBjb21wb25lbnQgPSAnY29tcG9uZW50Jykge1xuICAvLyBUT0RPIC0gY2hlY2sgZm9yIHByb2R1Y3Rpb24gKHVubGVzcyBkb25lIGJ5IHByb3AgdHlwZXMgcGFja2FnZT8pXG4gIGlmIChwcm9wcy5kZWJ1Zykge1xuICAgIFByb3BUeXBlcy5jaGVja1Byb3BUeXBlcyhwcm9wVHlwZXMsIHByb3BzLCAncHJvcCcsIGNvbXBvbmVudCk7XG4gIH1cbn1cblxuLy8gQSBzbWFsbCB3cmFwcGVyIGNsYXNzIGZvciBtYXBib3gtZ2xcbi8vIC0gUHJvdmlkZXMgYSBwcm9wIHN0eWxlIGludGVyZmFjZSAodGhhdCBjYW4gYmUgdHJpdmlhbGx5IHVzZWQgYnkgYSBSZWFjdCB3cmFwcGVyKVxuLy8gLSBNYWtlcyBzdXJlIG1hcGJveCBkb2Vzbid0IGNyYXNoIHVuZGVyIE5vZGVcbi8vIC0gSGFuZGxlcyBtYXAgcmV1c2UgKHRvIHdvcmsgYXJvdW5kIE1hcGJveCByZXNvdXJjZSBsZWFrIGlzc3Vlcylcbi8vIC0gUHJvdmlkZXMgc3VwcG9ydCBmb3Igc3BlY2lmeWluZyB0b2tlbnMgZHVyaW5nIGRldmVsb3BtZW50XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcGJveCB7XG4gIHN0YXRpYyBzdXBwb3J0ZWQoKSB7XG4gICAgcmV0dXJuIG1hcGJveGdsICYmIG1hcGJveGdsLnN1cHBvcnRlZCgpO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBpZiAoIW1hcGJveGdsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01hcGJveCBub3Qgc3VwcG9ydGVkJyk7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9wcyA9IHt9O1xuICAgIHRoaXMuX2luaXRpYWxpemUocHJvcHMpO1xuICB9XG5cbiAgZmluYWxpemUoKSB7XG4gICAgaWYgKCFtYXBib3hnbCB8fCAhdGhpcy5fbWFwKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLl9kZXN0cm95KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRQcm9wcyhwcm9wcykge1xuICAgIGlmICghbWFwYm94Z2wgfHwgIXRoaXMuX21hcCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlKHRoaXMucHJvcHMsIHByb3BzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIE1hcGJveCdzIG1hcC5yZXNpemUoKSByZWFkcyBzaXplIGZyb20gRE9NLCBzbyBET00gZWxlbWVudCBtdXN0IGFscmVhZHkgYmUgcmVzaXplZFxuICAvLyBJbiBhIHN5c3RlbSBsaWtlIFJlYWN0IHdlIG11c3Qgd2FpdCB0byByZWFkIHNpemUgdW50aWwgYWZ0ZXIgcmVuZGVyXG4gIC8vIChlLmcuIHVudGlsIFwiY29tcG9uZW50RGlkVXBkYXRlXCIpXG4gIHJlc2l6ZSgpIHtcbiAgICBpZiAoIW1hcGJveGdsIHx8ICF0aGlzLl9tYXApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuX21hcC5yZXNpemUoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIEV4dGVybmFsIGFwcHMgY2FuIGFjY2VzcyBtYXAgdGhpcyB3YXlcbiAgZ2V0TWFwKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXA7XG4gIH1cblxuICAvLyBQUklWQVRFIEFQSVxuXG4gIF9jcmVhdGUocHJvcHMpIHtcbiAgICAvLyBSZXVzZSBhIHNhdmVkIG1hcCwgaWYgYXZhaWxhYmxlXG4gICAgaWYgKHByb3BzLnJldXNlTWFwcyAmJiBNYXBib3guc2F2ZWRNYXApIHtcbiAgICAgIHRoaXMuX21hcCA9IHRoaXMubWFwID0gTWFwYm94LnNhdmVkTWFwO1xuICAgICAgTWFwYm94LnNhdmVkTWFwID0gbnVsbDtcbiAgICAgIC8vIFRPRE8gLSBuZWVkIHRvIGNhbGwgb25sb2FkIGFnYWluLCBuZWVkIHRvIHRyYWNrIHdpdGggUHJvbWlzZT9cbiAgICAgIHByb3BzLm9uTG9hZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBtYXBPcHRpb25zID0ge1xuICAgICAgICBjb250YWluZXI6IHByb3BzLmNvbnRhaW5lciB8fCBkb2N1bWVudC5ib2R5LFxuICAgICAgICBjZW50ZXI6IFtwcm9wcy5sb25naXR1ZGUsIHByb3BzLmxhdGl0dWRlXSxcbiAgICAgICAgem9vbTogcHJvcHMuem9vbSxcbiAgICAgICAgcGl0Y2g6IHByb3BzLnBpdGNoLFxuICAgICAgICBiZWFyaW5nOiBwcm9wcy5iZWFyaW5nLFxuICAgICAgICBzdHlsZTogcHJvcHMubWFwU3R5bGUsXG4gICAgICAgIGludGVyYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgYXR0cmlidXRpb25Db250cm9sOiBwcm9wcy5hdHRyaWJ1dGlvbkNvbnRyb2wsXG4gICAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogcHJvcHMucHJlc2VydmVEcmF3aW5nQnVmZmVyXG4gICAgICB9O1xuICAgICAgLy8gV2UgZG9uJ3Qgd2FudCB0byBwYXNzIGEgbnVsbCBvciBuby1vcCB0cmFuc2Zvcm1SZXF1ZXN0IGZ1bmN0aW9uLlxuICAgICAgaWYgKHByb3BzLnRyYW5zZm9ybVJlcXVlc3QpIHtcbiAgICAgICAgbWFwT3B0aW9ucy50cmFuc2Zvcm1SZXF1ZXN0ID0gcHJvcHMudHJhbnNmb3JtUmVxdWVzdDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX21hcCA9IHRoaXMubWFwID0gbmV3IG1hcGJveGdsLk1hcChtYXBPcHRpb25zKTtcbiAgICAgIC8vIEF0dGFjaCBvcHRpb25hbCBvbkxvYWQgZnVuY3Rpb25cbiAgICAgIHRoaXMubWFwLm9uY2UoJ2xvYWQnLCBwcm9wcy5vbkxvYWQpO1xuICAgICAgdGhpcy5tYXAub24oJ2Vycm9yJywgcHJvcHMub25FcnJvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfZGVzdHJveSgpIHtcbiAgICBpZiAoIU1hcGJveC5zYXZlZE1hcCkge1xuICAgICAgTWFwYm94LnNhdmVkTWFwID0gdGhpcy5fbWFwO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tYXAucmVtb3ZlKCk7XG4gICAgfVxuICB9XG5cbiAgX2luaXRpYWxpemUocHJvcHMpIHtcbiAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRQcm9wcywgcHJvcHMpO1xuICAgIGNoZWNrUHJvcFR5cGVzKHByb3BzLCAnTWFwYm94Jyk7XG5cbiAgICAvLyBNYWtlIGVtcHR5IHN0cmluZyBwaWNrIHVwIGRlZmF1bHQgcHJvcFxuICAgIHRoaXMuYWNjZXNzVG9rZW4gPSBwcm9wcy5tYXBib3hBcGlBY2Nlc3NUb2tlbiB8fCBkZWZhdWx0UHJvcHMubWFwYm94QXBpQWNjZXNzVG9rZW47XG5cbiAgICAvLyBDcmVhdGlvbiBvbmx5IHByb3BzXG4gICAgaWYgKG1hcGJveGdsKSB7XG4gICAgICBpZiAoIXRoaXMuYWNjZXNzVG9rZW4pIHtcbiAgICAgICAgbWFwYm94Z2wuYWNjZXNzVG9rZW4gPSAnbm8tdG9rZW4nOyAvLyBQcmV2ZW50cyBtYXBib3ggZnJvbSB0aHJvd2luZ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWFwYm94Z2wuYWNjZXNzVG9rZW4gPSB0aGlzLmFjY2Vzc1Rva2VuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2NyZWF0ZShwcm9wcyk7XG5cbiAgICAvLyBEaXNhYmxlIG91dGxpbmUgc3R5bGVcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLm1hcC5nZXRDYW52YXMoKTtcbiAgICBpZiAoY2FudmFzKSB7XG4gICAgICBjYW52YXMuc3R5bGUub3V0bGluZSA9ICdub25lJztcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVNYXBWaWV3cG9ydCh7fSwgcHJvcHMpO1xuICAgIHRoaXMuX3VwZGF0ZU1hcFNpemUoe30sIHByb3BzKTtcblxuICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgfVxuXG4gIF91cGRhdGUob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgbmV3UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCBuZXdQcm9wcyk7XG4gICAgY2hlY2tQcm9wVHlwZXMobmV3UHJvcHMsICdNYXBib3gnKTtcblxuICAgIHRoaXMuX3VwZGF0ZU1hcFZpZXdwb3J0KG9sZFByb3BzLCBuZXdQcm9wcyk7XG4gICAgdGhpcy5fdXBkYXRlTWFwU2l6ZShvbGRQcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgdGhpcy5wcm9wcyA9IG5ld1Byb3BzO1xuICB9XG5cbiAgX3VwZGF0ZU1hcFZpZXdwb3J0KG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IHZpZXdwb3J0Q2hhbmdlZCA9XG4gICAgICBuZXdQcm9wcy5sYXRpdHVkZSAhPT0gb2xkUHJvcHMubGF0aXR1ZGUgfHxcbiAgICAgIG5ld1Byb3BzLmxvbmdpdHVkZSAhPT0gb2xkUHJvcHMubG9uZ2l0dWRlIHx8XG4gICAgICBuZXdQcm9wcy56b29tICE9PSBvbGRQcm9wcy56b29tIHx8XG4gICAgICBuZXdQcm9wcy5waXRjaCAhPT0gb2xkUHJvcHMucGl0Y2ggfHxcbiAgICAgIG5ld1Byb3BzLmJlYXJpbmcgIT09IG9sZFByb3BzLmJlYXJpbmcgfHxcbiAgICAgIG5ld1Byb3BzLmFsdGl0dWRlICE9PSBvbGRQcm9wcy5hbHRpdHVkZTtcblxuICAgIGlmICh2aWV3cG9ydENoYW5nZWQpIHtcbiAgICAgIHRoaXMuX21hcC5qdW1wVG8oe1xuICAgICAgICBjZW50ZXI6IFtuZXdQcm9wcy5sb25naXR1ZGUsIG5ld1Byb3BzLmxhdGl0dWRlXSxcbiAgICAgICAgem9vbTogbmV3UHJvcHMuem9vbSxcbiAgICAgICAgYmVhcmluZzogbmV3UHJvcHMuYmVhcmluZyxcbiAgICAgICAgcGl0Y2g6IG5ld1Byb3BzLnBpdGNoXG4gICAgICB9KTtcblxuICAgICAgLy8gVE9ETyAtIGp1bXBUbyBkb2Vzbid0IGhhbmRsZSBhbHRpdHVkZVxuICAgICAgaWYgKG5ld1Byb3BzLmFsdGl0dWRlICE9PSBvbGRQcm9wcy5hbHRpdHVkZSkge1xuICAgICAgICB0aGlzLl9tYXAudHJhbnNmb3JtLmFsdGl0dWRlID0gbmV3UHJvcHMuYWx0aXR1ZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gTm90ZTogbmVlZHMgdG8gYmUgY2FsbGVkIGFmdGVyIHJlbmRlciAoZS5nLiBpbiBjb21wb25lbnREaWRVcGRhdGUpXG4gIF91cGRhdGVNYXBTaXplKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IHNpemVDaGFuZ2VkID0gb2xkUHJvcHMud2lkdGggIT09IG5ld1Byb3BzLndpZHRoIHx8IG9sZFByb3BzLmhlaWdodCAhPT0gbmV3UHJvcHMuaGVpZ2h0O1xuICAgIGlmIChzaXplQ2hhbmdlZCkge1xuICAgICAgdGhpcy5fbWFwLnJlc2l6ZSgpO1xuICAgIH1cbiAgfVxufVxuXG5NYXBib3gucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuTWFwYm94LmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbiJdfQ==