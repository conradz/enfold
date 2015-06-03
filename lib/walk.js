var path = require('path')
var eachAsync = require('each-async')
var map = require('lodash/collection/map')
var has = require('lodash/object/has')
var uniq = require('lodash/array/uniq')
var values = require('lodash/object/values')

module.exports = walk

function walk (files, enfold, cb) {
  var include = {}
  var entry = map(files, function (f) { return path.resolve(f) })
  return eachAsync(entry, processEntry, done)

  function processEntry (file, i, cb) {
    return process(file, cb)
  }

  function process (file, cb) {
    if (has(include, file)) {
      return cb()
    }

    var item = { file: file, ast: null, dependencies: null }
    include[file] = item
    enfold._parse(file, parsed)

    function parsed (err, ast) {
      if (err) {
        return cb(err)
      }

      item.ast = ast

      enfold._dependencies(file, resolved)
    }

    function resolved (err, deps) {
      if (err) {
        return cb(err)
      }

      item.dependencies = deps
      eachAsync(uniq(values(deps)), processDep, cb)
    }

    function processDep (file, i, cb) {
      return process(file, cb)
    }
  }

  function done (err) {
    if (err) {
      return cb(err)
    }

    return cb(null, { entry: entry, include: include })
  }
}
