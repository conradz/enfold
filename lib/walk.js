var path = require('path')
var forEach = require('lodash/collection/forEach')
var map = require('lodash/collection/map')
var has = require('lodash/object/has')
var uniq = require('lodash/array/uniq')
var values = require('lodash/object/values')

module.exports = walk

function walk (files, enfold) {
  var include = {}
  var entry = map(files, function (f) { return path.resolve(f) })

  forEach(entry, process)
  return {
    entry: entry,
    include: include
  }

  function process (file) {
    if (has(include, file)) {
      return
    }

    var ast = enfold._parse(file)
    var deps = enfold._dependencies(file)

    include[file] = {
      file: file,
      ast: ast,
      dependencies: deps
    }

    forEach(uniq(values(deps)), process)
  }
}
