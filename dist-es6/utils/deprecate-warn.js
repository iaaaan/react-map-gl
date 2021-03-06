// 'new' is optional
var DEPRECATED_PROPS = [{ old: 'onChangeViewport', new: 'onViewportChange' }, { old: 'perspectiveEnabled', new: 'dragRotate' }, { old: 'onHoverFeatures', new: 'onHover' }, { old: 'onClickFeatures', new: 'onClick' }, { old: 'touchZoomRotate', new: 'touchZoom, touchRotate' }];

function getDeprecatedText(name) {
  return 'react-map-gl: `' + name + '` is deprecated and will be removed in a later version.';
}

function getNewText(name) {
  return 'Use `' + name + '` instead.';
}

/**
 * Checks props object for any prop that is deprecated and insert a console
 * warning to the user. This will also print out the recommended new prop/API
 * if one exists.
 */
export default function checkDeprecatedProps() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  /* eslint-disable no-console, no-undef */
  DEPRECATED_PROPS.forEach(function (depProp) {
    if (props.hasOwnProperty(depProp.old)) {
      var warnMessage = getDeprecatedText(depProp.old);
      if (depProp.new) {
        warnMessage = warnMessage + ' ' + getNewText(depProp.new);
      }
      console.warn(warnMessage);
    }
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9kZXByZWNhdGUtd2Fybi5qcyJdLCJuYW1lcyI6WyJERVBSRUNBVEVEX1BST1BTIiwib2xkIiwibmV3IiwiZ2V0RGVwcmVjYXRlZFRleHQiLCJuYW1lIiwiZ2V0TmV3VGV4dCIsImNoZWNrRGVwcmVjYXRlZFByb3BzIiwicHJvcHMiLCJmb3JFYWNoIiwiZGVwUHJvcCIsImhhc093blByb3BlcnR5Iiwid2Fybk1lc3NhZ2UiLCJjb25zb2xlIiwid2FybiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxJQUFNQSxtQkFBbUIsQ0FDdkIsRUFBQ0MsS0FBSyxrQkFBTixFQUEwQkMsS0FBSyxrQkFBL0IsRUFEdUIsRUFFdkIsRUFBQ0QsS0FBSyxvQkFBTixFQUE0QkMsS0FBSyxZQUFqQyxFQUZ1QixFQUd2QixFQUFDRCxLQUFLLGlCQUFOLEVBQXlCQyxLQUFLLFNBQTlCLEVBSHVCLEVBSXZCLEVBQUNELEtBQUssaUJBQU4sRUFBeUJDLEtBQUssU0FBOUIsRUFKdUIsRUFLdkIsRUFBQ0QsS0FBSyxpQkFBTixFQUF5QkMsS0FBSyx3QkFBOUIsRUFMdUIsQ0FBekI7O0FBUUEsU0FBU0MsaUJBQVQsQ0FBMkJDLElBQTNCLEVBQWlDO0FBQy9CLDZCQUEwQkEsSUFBMUI7QUFDRDs7QUFFRCxTQUFTQyxVQUFULENBQW9CRCxJQUFwQixFQUEwQjtBQUN4QixtQkFBZ0JBLElBQWhCO0FBQ0Q7O0FBRUQ7Ozs7O0FBS0EsZUFBZSxTQUFTRSxvQkFBVCxHQUEwQztBQUFBLE1BQVpDLEtBQVksdUVBQUosRUFBSTs7QUFDdkQ7QUFDQVAsbUJBQWlCUSxPQUFqQixDQUF5QixVQUFDQyxPQUFELEVBQWE7QUFDcEMsUUFBSUYsTUFBTUcsY0FBTixDQUFxQkQsUUFBUVIsR0FBN0IsQ0FBSixFQUF1QztBQUNyQyxVQUFJVSxjQUFjUixrQkFBa0JNLFFBQVFSLEdBQTFCLENBQWxCO0FBQ0EsVUFBSVEsUUFBUVAsR0FBWixFQUFpQjtBQUNmUyxzQkFBaUJBLFdBQWpCLFNBQWdDTixXQUFXSSxRQUFRUCxHQUFuQixDQUFoQztBQUNEO0FBQ0RVLGNBQVFDLElBQVIsQ0FBYUYsV0FBYjtBQUNEO0FBQ0YsR0FSRDtBQVNEIiwiZmlsZSI6ImRlcHJlY2F0ZS13YXJuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gJ25ldycgaXMgb3B0aW9uYWxcbmNvbnN0IERFUFJFQ0FURURfUFJPUFMgPSBbXG4gIHtvbGQ6ICdvbkNoYW5nZVZpZXdwb3J0JywgbmV3OiAnb25WaWV3cG9ydENoYW5nZSd9LFxuICB7b2xkOiAncGVyc3BlY3RpdmVFbmFibGVkJywgbmV3OiAnZHJhZ1JvdGF0ZSd9LFxuICB7b2xkOiAnb25Ib3ZlckZlYXR1cmVzJywgbmV3OiAnb25Ib3Zlcid9LFxuICB7b2xkOiAnb25DbGlja0ZlYXR1cmVzJywgbmV3OiAnb25DbGljayd9LFxuICB7b2xkOiAndG91Y2hab29tUm90YXRlJywgbmV3OiAndG91Y2hab29tLCB0b3VjaFJvdGF0ZSd9XG5dO1xuXG5mdW5jdGlvbiBnZXREZXByZWNhdGVkVGV4dChuYW1lKSB7XG4gIHJldHVybiBgcmVhY3QtbWFwLWdsOiBcXGAke25hbWV9XFxgIGlzIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBhIGxhdGVyIHZlcnNpb24uYDtcbn1cblxuZnVuY3Rpb24gZ2V0TmV3VGV4dChuYW1lKSB7XG4gIHJldHVybiBgVXNlIFxcYCR7bmFtZX1cXGAgaW5zdGVhZC5gO1xufVxuXG4vKipcbiAqIENoZWNrcyBwcm9wcyBvYmplY3QgZm9yIGFueSBwcm9wIHRoYXQgaXMgZGVwcmVjYXRlZCBhbmQgaW5zZXJ0IGEgY29uc29sZVxuICogd2FybmluZyB0byB0aGUgdXNlci4gVGhpcyB3aWxsIGFsc28gcHJpbnQgb3V0IHRoZSByZWNvbW1lbmRlZCBuZXcgcHJvcC9BUElcbiAqIGlmIG9uZSBleGlzdHMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNoZWNrRGVwcmVjYXRlZFByb3BzKHByb3BzID0ge30pIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSwgbm8tdW5kZWYgKi9cbiAgREVQUkVDQVRFRF9QUk9QUy5mb3JFYWNoKChkZXBQcm9wKSA9PiB7XG4gICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KGRlcFByb3Aub2xkKSkge1xuICAgICAgbGV0IHdhcm5NZXNzYWdlID0gZ2V0RGVwcmVjYXRlZFRleHQoZGVwUHJvcC5vbGQpO1xuICAgICAgaWYgKGRlcFByb3AubmV3KSB7XG4gICAgICAgIHdhcm5NZXNzYWdlID0gYCR7d2Fybk1lc3NhZ2V9ICR7Z2V0TmV3VGV4dChkZXBQcm9wLm5ldyl9YDtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUud2Fybih3YXJuTWVzc2FnZSk7XG4gICAgfVxuICB9KTtcbn1cbiJdfQ==