var path = require('path')
var eachAsync = require('each-async')
var map = require('lodash/collection/map')
var has = require('lodash/object/has')
var uniq = require('lodash/array/uniq')
var resolve = require('./resolve')
var parse = require('./parse')
var inject = require('./inject')
var dependencies = require('./dependencies')

module.exports = walk

function walk (files, cb) {
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

    var item = { file: file, ast: null, dependencies: {} }
    include[file] = item
    parse(file, parsed)

    function parsed (err, ast) {
      if (err) {
        return cb(err)
      }

      item.ast = inject(ast, file)
      var deps = uniq(dependencies(item.ast))
      return eachAsync(deps, processDep, cb)
    }

    function processDep (dep, i, cb) {
      resolve({ id: dep, parent: file }, resolved)

      function resolved (err, file) {
        if (err) {
          return cb(err)
        }

        item.dependencies[dep] = file
        return process(file, cb)
      }
    }
  }

  function done (err) {
    if (err) {
      return cb(err)
    }

    return cb(null, { entry: entry, include: include })
  }
}
