// Safe replacement for @babel/runtime/helpers/objectWithoutPropertiesLoose
// Implements a minimal helper compatible with both CJS and ESM interop.
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  for (var i = 0; i < sourceKeys.length; i++) {
    var key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

module.exports = _objectWithoutPropertiesLoose;
module.exports.default = _objectWithoutPropertiesLoose;
module.exports.__esModule = true;

