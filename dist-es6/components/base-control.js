var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
import { Component } from 'react';
import PropTypes from 'prop-types';
import WebMercatorViewport from 'viewport-mercator-project';

var propTypes = {
  /** Event handling */
  captureScroll: PropTypes.bool,
  // Stop map pan & rotate
  captureDrag: PropTypes.bool,
  // Stop map click
  captureClick: PropTypes.bool,
  // Stop map double click
  captureDoubleClick: PropTypes.bool
};

var defaultProps = {
  captureScroll: false,
  captureDrag: true,
  captureClick: true,
  captureDoubleClick: true
};

var contextTypes = {
  viewport: PropTypes.instanceOf(WebMercatorViewport),
  isDragging: PropTypes.bool,
  eventManager: PropTypes.object
};

var EVENT_MAP = {
  captureScroll: 'wheel',
  captureDrag: 'panstart',
  captureClick: 'click',
  captureDoubleClick: 'dblclick'
};

/*
 * PureComponent doesn't update when context changes.
 * The only way is to implement our own shouldComponentUpdate here. Considering
 * the parent component (StaticMap or InteractiveMap) is pure, and map re-render
 * is almost always triggered by a viewport change, we almost definitely need to
 * recalculate the marker's position when the parent re-renders.
 */

var BaseControl = function (_Component) {
  _inherits(BaseControl, _Component);

  function BaseControl(props) {
    _classCallCheck(this, BaseControl);

    var _this = _possibleConstructorReturn(this, (BaseControl.__proto__ || Object.getPrototypeOf(BaseControl)).call(this, props));

    _this._events = null;

    _this._onContainerLoad = _this._onContainerLoad.bind(_this);
    return _this;
  }

  _createClass(BaseControl, [{
    key: '_onContainerLoad',
    value: function _onContainerLoad(ref) {
      var eventManager = this.context.eventManager;

      var events = this._events;

      // Remove all previously registered events
      if (events) {
        eventManager.off(events);
        events = null;
      }

      if (ref) {
        // container is mounted: register events for this element
        events = {};

        for (var propName in EVENT_MAP) {
          var shouldCapture = this.props[propName];
          var eventName = EVENT_MAP[propName];

          if (shouldCapture) {
            events[eventName] = this._captureEvent;
          }
        }

        eventManager.on(events, ref);
      }

      this._events = events;
    }
  }, {
    key: '_captureEvent',
    value: function _captureEvent(evt) {
      evt.stopPropagation();
    }
  }, {
    key: 'render',
    value: function render() {
      return null;
    }
  }]);

  return BaseControl;
}(Component);

export default BaseControl;


BaseControl.propTypes = propTypes;
BaseControl.defaultProps = defaultProps;
BaseControl.contextTypes = contextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2Jhc2UtY29udHJvbC5qcyJdLCJuYW1lcyI6WyJDb21wb25lbnQiLCJQcm9wVHlwZXMiLCJXZWJNZXJjYXRvclZpZXdwb3J0IiwicHJvcFR5cGVzIiwiY2FwdHVyZVNjcm9sbCIsImJvb2wiLCJjYXB0dXJlRHJhZyIsImNhcHR1cmVDbGljayIsImNhcHR1cmVEb3VibGVDbGljayIsImRlZmF1bHRQcm9wcyIsImNvbnRleHRUeXBlcyIsInZpZXdwb3J0IiwiaW5zdGFuY2VPZiIsImlzRHJhZ2dpbmciLCJldmVudE1hbmFnZXIiLCJvYmplY3QiLCJFVkVOVF9NQVAiLCJCYXNlQ29udHJvbCIsInByb3BzIiwiX2V2ZW50cyIsIl9vbkNvbnRhaW5lckxvYWQiLCJiaW5kIiwicmVmIiwiY29udGV4dCIsImV2ZW50cyIsIm9mZiIsInByb3BOYW1lIiwic2hvdWxkQ2FwdHVyZSIsImV2ZW50TmFtZSIsIl9jYXB0dXJlRXZlbnQiLCJvbiIsImV2dCIsInN0b3BQcm9wYWdhdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVFBLFNBQVIsUUFBd0IsT0FBeEI7QUFDQSxPQUFPQyxTQUFQLE1BQXNCLFlBQXRCO0FBQ0EsT0FBT0MsbUJBQVAsTUFBZ0MsMkJBQWhDOztBQUVBLElBQU1DLFlBQVk7QUFDaEI7QUFDQUMsaUJBQWVILFVBQVVJLElBRlQ7QUFHaEI7QUFDQUMsZUFBYUwsVUFBVUksSUFKUDtBQUtoQjtBQUNBRSxnQkFBY04sVUFBVUksSUFOUjtBQU9oQjtBQUNBRyxzQkFBb0JQLFVBQVVJO0FBUmQsQ0FBbEI7O0FBV0EsSUFBTUksZUFBZTtBQUNuQkwsaUJBQWUsS0FESTtBQUVuQkUsZUFBYSxJQUZNO0FBR25CQyxnQkFBYyxJQUhLO0FBSW5CQyxzQkFBb0I7QUFKRCxDQUFyQjs7QUFPQSxJQUFNRSxlQUFlO0FBQ25CQyxZQUFVVixVQUFVVyxVQUFWLENBQXFCVixtQkFBckIsQ0FEUztBQUVuQlcsY0FBWVosVUFBVUksSUFGSDtBQUduQlMsZ0JBQWNiLFVBQVVjO0FBSEwsQ0FBckI7O0FBTUEsSUFBTUMsWUFBWTtBQUNoQlosaUJBQWUsT0FEQztBQUVoQkUsZUFBYSxVQUZHO0FBR2hCQyxnQkFBYyxPQUhFO0FBSWhCQyxzQkFBb0I7QUFKSixDQUFsQjs7QUFPQTs7Ozs7Ozs7SUFPcUJTLFc7OztBQUVuQix1QkFBWUMsS0FBWixFQUFtQjtBQUFBOztBQUFBLDBIQUNYQSxLQURXOztBQUdqQixVQUFLQyxPQUFMLEdBQWUsSUFBZjs7QUFFQSxVQUFLQyxnQkFBTCxHQUF3QixNQUFLQSxnQkFBTCxDQUFzQkMsSUFBdEIsT0FBeEI7QUFMaUI7QUFNbEI7Ozs7cUNBRWdCQyxHLEVBQUs7QUFBQSxVQUNiUixZQURhLEdBQ0csS0FBS1MsT0FEUixDQUNiVCxZQURhOztBQUVwQixVQUFJVSxTQUFTLEtBQUtMLE9BQWxCOztBQUVBO0FBQ0EsVUFBSUssTUFBSixFQUFZO0FBQ1ZWLHFCQUFhVyxHQUFiLENBQWlCRCxNQUFqQjtBQUNBQSxpQkFBUyxJQUFUO0FBQ0Q7O0FBRUQsVUFBSUYsR0FBSixFQUFTO0FBQ1A7QUFDQUUsaUJBQVMsRUFBVDs7QUFFQSxhQUFLLElBQU1FLFFBQVgsSUFBdUJWLFNBQXZCLEVBQWtDO0FBQ2hDLGNBQU1XLGdCQUFnQixLQUFLVCxLQUFMLENBQVdRLFFBQVgsQ0FBdEI7QUFDQSxjQUFNRSxZQUFZWixVQUFVVSxRQUFWLENBQWxCOztBQUVBLGNBQUlDLGFBQUosRUFBbUI7QUFDakJILG1CQUFPSSxTQUFQLElBQW9CLEtBQUtDLGFBQXpCO0FBQ0Q7QUFDRjs7QUFFRGYscUJBQWFnQixFQUFiLENBQWdCTixNQUFoQixFQUF3QkYsR0FBeEI7QUFDRDs7QUFFRCxXQUFLSCxPQUFMLEdBQWVLLE1BQWY7QUFDRDs7O2tDQUVhTyxHLEVBQUs7QUFDakJBLFVBQUlDLGVBQUo7QUFDRDs7OzZCQUVRO0FBQ1AsYUFBTyxJQUFQO0FBQ0Q7Ozs7RUE3Q3NDaEMsUzs7ZUFBcEJpQixXOzs7QUFpRHJCQSxZQUFZZCxTQUFaLEdBQXdCQSxTQUF4QjtBQUNBYyxZQUFZUixZQUFaLEdBQTJCQSxZQUEzQjtBQUNBUSxZQUFZUCxZQUFaLEdBQTJCQSxZQUEzQiIsImZpbGUiOiJiYXNlLWNvbnRyb2wuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cblxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgV2ViTWVyY2F0b3JWaWV3cG9ydCBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcblxuY29uc3QgcHJvcFR5cGVzID0ge1xuICAvKiogRXZlbnQgaGFuZGxpbmcgKi9cbiAgY2FwdHVyZVNjcm9sbDogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIFN0b3AgbWFwIHBhbiAmIHJvdGF0ZVxuICBjYXB0dXJlRHJhZzogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIFN0b3AgbWFwIGNsaWNrXG4gIGNhcHR1cmVDbGljazogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIFN0b3AgbWFwIGRvdWJsZSBjbGlja1xuICBjYXB0dXJlRG91YmxlQ2xpY2s6IFByb3BUeXBlcy5ib29sXG59O1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIGNhcHR1cmVTY3JvbGw6IGZhbHNlLFxuICBjYXB0dXJlRHJhZzogdHJ1ZSxcbiAgY2FwdHVyZUNsaWNrOiB0cnVlLFxuICBjYXB0dXJlRG91YmxlQ2xpY2s6IHRydWVcbn07XG5cbmNvbnN0IGNvbnRleHRUeXBlcyA9IHtcbiAgdmlld3BvcnQ6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFdlYk1lcmNhdG9yVmlld3BvcnQpLFxuICBpc0RyYWdnaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgZXZlbnRNYW5hZ2VyOiBQcm9wVHlwZXMub2JqZWN0XG59O1xuXG5jb25zdCBFVkVOVF9NQVAgPSB7XG4gIGNhcHR1cmVTY3JvbGw6ICd3aGVlbCcsXG4gIGNhcHR1cmVEcmFnOiAncGFuc3RhcnQnLFxuICBjYXB0dXJlQ2xpY2s6ICdjbGljaycsXG4gIGNhcHR1cmVEb3VibGVDbGljazogJ2RibGNsaWNrJ1xufTtcblxuLypcbiAqIFB1cmVDb21wb25lbnQgZG9lc24ndCB1cGRhdGUgd2hlbiBjb250ZXh0IGNoYW5nZXMuXG4gKiBUaGUgb25seSB3YXkgaXMgdG8gaW1wbGVtZW50IG91ciBvd24gc2hvdWxkQ29tcG9uZW50VXBkYXRlIGhlcmUuIENvbnNpZGVyaW5nXG4gKiB0aGUgcGFyZW50IGNvbXBvbmVudCAoU3RhdGljTWFwIG9yIEludGVyYWN0aXZlTWFwKSBpcyBwdXJlLCBhbmQgbWFwIHJlLXJlbmRlclxuICogaXMgYWxtb3N0IGFsd2F5cyB0cmlnZ2VyZWQgYnkgYSB2aWV3cG9ydCBjaGFuZ2UsIHdlIGFsbW9zdCBkZWZpbml0ZWx5IG5lZWQgdG9cbiAqIHJlY2FsY3VsYXRlIHRoZSBtYXJrZXIncyBwb3NpdGlvbiB3aGVuIHRoZSBwYXJlbnQgcmUtcmVuZGVycy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZUNvbnRyb2wgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5fZXZlbnRzID0gbnVsbDtcblxuICAgIHRoaXMuX29uQ29udGFpbmVyTG9hZCA9IHRoaXMuX29uQ29udGFpbmVyTG9hZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgX29uQ29udGFpbmVyTG9hZChyZWYpIHtcbiAgICBjb25zdCB7ZXZlbnRNYW5hZ2VyfSA9IHRoaXMuY29udGV4dDtcbiAgICBsZXQgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuXG4gICAgLy8gUmVtb3ZlIGFsbCBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgZXZlbnRzXG4gICAgaWYgKGV2ZW50cykge1xuICAgICAgZXZlbnRNYW5hZ2VyLm9mZihldmVudHMpO1xuICAgICAgZXZlbnRzID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAocmVmKSB7XG4gICAgICAvLyBjb250YWluZXIgaXMgbW91bnRlZDogcmVnaXN0ZXIgZXZlbnRzIGZvciB0aGlzIGVsZW1lbnRcbiAgICAgIGV2ZW50cyA9IHt9O1xuXG4gICAgICBmb3IgKGNvbnN0IHByb3BOYW1lIGluIEVWRU5UX01BUCkge1xuICAgICAgICBjb25zdCBzaG91bGRDYXB0dXJlID0gdGhpcy5wcm9wc1twcm9wTmFtZV07XG4gICAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IEVWRU5UX01BUFtwcm9wTmFtZV07XG5cbiAgICAgICAgaWYgKHNob3VsZENhcHR1cmUpIHtcbiAgICAgICAgICBldmVudHNbZXZlbnROYW1lXSA9IHRoaXMuX2NhcHR1cmVFdmVudDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBldmVudE1hbmFnZXIub24oZXZlbnRzLCByZWYpO1xuICAgIH1cblxuICAgIHRoaXMuX2V2ZW50cyA9IGV2ZW50cztcbiAgfVxuXG4gIF9jYXB0dXJlRXZlbnQoZXZ0KSB7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbn1cblxuQmFzZUNvbnRyb2wucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuQmFzZUNvbnRyb2wuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuQmFzZUNvbnRyb2wuY29udGV4dFR5cGVzID0gY29udGV4dFR5cGVzO1xuIl19