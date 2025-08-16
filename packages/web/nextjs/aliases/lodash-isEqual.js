// Minimal deep equality check to replace lodash/isEqual for SSR build
function isObject(val) {
  return val !== null && typeof val === 'object';
}

function isEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (isObject(a) && isObject(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
      if (!isEqual(a[k], b[k])) return false;
    }
    return true;
  }
  // Fallback for other types (Date, etc.)
  // Compare by valueOf when available
  if (a && typeof a.valueOf === 'function' && b && typeof b.valueOf === 'function') {
    return a.valueOf() === b.valueOf();
  }
  return false;
}

module.exports = isEqual;
module.exports.default = isEqual;
module.exports.__esModule = true;

