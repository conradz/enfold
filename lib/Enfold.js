var escodegen = require('escodegen')
var defaults = require('lodash/object/defaults')
var has = require('lodash/object/has')
var keys = require('lodash/object/keys')
var uniq = require('lodash/array/uniq')
var forEach = require('lodash/collection/forEach')
var isEqual = require('lodash/lang/isEqual')
var path = require('path')
var parse = require('./parse')
var inject = require('./inject')
var resolve = require('./resolve')
var dependencies = require('./dependencies')
var walk = require('./walk')
var link = require('./link')
var pack = require('./pack')

module.exports = Enfold

function Enfold (options) {
  this.options = defaults(options || {}, {
    target: 'browser',
    parse: parse,
    entry: [],
    alias: null,
    file: 'index.js',
    map: true
  })

  this._parsed = {}
  this._deps = {}
  this._resolved = {}
  this._graph = null
}

Enfold.prototype.pack = function (entry) {
  var graph = this._walk(entry)
  graph = link(graph)
  var ast = pack(graph)
  var result = escodegen.generate(ast, {
    sourceMap: this.options.map ? this.options.file : null,
    sourceMapWithCode: true
  })

  if (result.map) {
    forEach(this._parsed, function (item, file) {
      if (item.source) {
        result.map.setSourceContent(file, item.source)
      }
    })
  }

  return {
    code: result.code,
    map: result.map
  }
}

Enfold.prototype.invalidate = function (file) {
  file = path.resolve(file)
  if (!has(this._parsed, file)) {
    return false
  }

  delete this._parsed[file]
  this._invalidateDeps(file)
  this._graph = null
  return true
}

Enfold.prototype._invalidateDeps = function (file) {
  if (!has(this._resolved, file)) {
    return
  }

  var ast
  try {
    ast = this._parse(file)
  } catch (e) {
    return this._invalidateAll(file)
  }

  var oldDeps = this._deps[file]
  var newDeps = dependencies(ast)
  if (isEqual(oldDeps, newDeps)) {
    return
  }

  delete this._resolved[file]
  this._deps[file] = newDeps
}

Enfold.prototype._invalidateAll = function (file) {
  delete this._deps[file]
  delete this._resolved[file]

  forEach(this._resolved, function (resolved) {
    forEach(keys(resolved), function (k) {
      if (resolved[k] === file) {
        resolved[k] = null
      }
    })
  })
}

Enfold.prototype._walk = function (entry) {
  if (!this._graph) {
    this._graph = walk(entry, this)
  }

  return this._graph
}

Enfold.prototype._parse = function (file) {
  if (has(this._parsed, file)) {
    return this._parsed[file].ast
  }

  var parse = this.options.parse
  var result = parse(file)
  var ast = inject(result.ast, file)
  var source = result.source || null
  this._parsed[file] = { source: source, ast: ast }
  return ast
}

Enfold.prototype._resolve = function (dep, parent) {
  return resolve({
    target: this.options.target,
    alias: this.options.alias,
    id: dep,
    parent: parent
  })
}

Enfold.prototype._dependencies = function (file) {
  if (has(this._resolved, file)) {
    return this._dependenciesCached(file)
  }

  var deps = has(this._deps, file) ? this._deps[file] : dependencies(this._parse(file))
  var resolved = {}

  forEach(uniq(deps), resolveDep, this)
  this._deps[file] = deps
  this._resolved[file] = resolved
  return resolved

  function resolveDep (dep, i, cb) {
    resolved[dep] = this._resolve(dep, file)
  }
}

Enfold.prototype._dependenciesCached = function (file) {
  var deps = this._resolved[file]
  forEach(deps, function (value, key) {
    if (value === null) {
      deps[key] = this._resolve(key, file)
    }
  })

  return deps
}
