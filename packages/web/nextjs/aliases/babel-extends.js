// Safe replacement for @babel/runtime/helpers/extends
// Provides a default export compatible with both CJS and ESM consumers.
function _extends() {
  // Use native Object.assign when available
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

module.exports = _extends;
module.exports.default = _extends;
module.exports.__esModule = true;

