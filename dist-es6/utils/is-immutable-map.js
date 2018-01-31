/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * MIT license
 */

/**
 * https://github.com/facebook/immutable-js/blob/master/src/Map.js
 * This is to avoid importing the full `immutable` module for type check
 * @returns `true` if object is an immutable.js Map instance
 */
var IS_MAP_SENTINEL = '@@__IMMUTABLE_MAP__@@';

export default function isMap(maybeMap) {
  return Boolean(maybeMap && maybeMap[IS_MAP_SENTINEL]);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9pcy1pbW11dGFibGUtbWFwLmpzIl0sIm5hbWVzIjpbIklTX01BUF9TRU5USU5FTCIsImlzTWFwIiwibWF5YmVNYXAiLCJCb29sZWFuIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUFLQTs7Ozs7QUFLQSxJQUFNQSxrQkFBa0IsdUJBQXhCOztBQUVBLGVBQWUsU0FBU0MsS0FBVCxDQUFlQyxRQUFmLEVBQXlCO0FBQ3RDLFNBQU9DLFFBQVFELFlBQVlBLFNBQVNGLGVBQVQsQ0FBcEIsQ0FBUDtBQUNEIiwiZmlsZSI6ImlzLWltbXV0YWJsZS1tYXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogTUlUIGxpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9pbW11dGFibGUtanMvYmxvYi9tYXN0ZXIvc3JjL01hcC5qc1xuICogVGhpcyBpcyB0byBhdm9pZCBpbXBvcnRpbmcgdGhlIGZ1bGwgYGltbXV0YWJsZWAgbW9kdWxlIGZvciB0eXBlIGNoZWNrXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgb2JqZWN0IGlzIGFuIGltbXV0YWJsZS5qcyBNYXAgaW5zdGFuY2VcbiAqL1xuY29uc3QgSVNfTUFQX1NFTlRJTkVMID0gJ0BAX19JTU1VVEFCTEVfTUFQX19AQCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlzTWFwKG1heWJlTWFwKSB7XG4gIHJldHVybiBCb29sZWFuKG1heWJlTWFwICYmIG1heWJlTWFwW0lTX01BUF9TRU5USU5FTF0pO1xufVxuIl19