var map = require('lodash/collection/map')
var isArray = require('lodash/lang/isArray')
var isRegExp = require('lodash/lang/isRegExp')

module.exports = clone

function clone (value) {
  return isPrimitive(value) ? value :
    isArray(value) ? cloneArray(value) : cloneObject(value)
}

function isPrimitive (value) {
  return value === null ||
    typeof value !== 'object' ||
    isRegExp(value)
}

function cloneObject (obj) {
  var target = {}
  for (var k in obj) {
    if (k[0] !== '_') {
      target[k] = clone(obj[k])
    }
  }

  return target
}

function cloneArray (arr) {
  return map(arr, clone)
}
