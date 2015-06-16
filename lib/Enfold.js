var fs = require('fs')
var escodegen = require('escodegen')
var nodeResolver = require('resolve')
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
    map: true
  })

  this._files = {}
  this._fileExists = {}
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
    sourceMap: this.options.map ? true : null,
    sourceMapWithCode: true
  })

  var map = result.map
  if (map) {
    forEach(this._parsed, function (item) {
      if (item.source) {
        map.setSourceContent(item.file, item.source)
      }
    })
  }

  return {
    code: result.code,
    map: map
  }
}

Enfold.prototype.invalidate = function (file) {
  file = path.resolve(file)

  var isChanged = false
  if (has(this._fileExists, file)) {
    this._invalidateFile(file)
    isChanged = true
  }
  if (has(this._parsed, file)) {
    this._invalidateParsed(file)
    isChanged = true
  }

  return isChanged
}

Enfold.prototype._invalidateParsed = function (file) {
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

Enfold.prototype._invalidateFile = function (file) {
  delete this._files[file]
  delete this._fileExists[file]
  this._resolved = {}
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
  this._parsed[file] = {
    file: result.file || file,
    source: source,
    ast: ast
  }

  return ast
}

Enfold.prototype._resolve = function (dep, parent) {
  return resolve({
    target: this.options.target,
    alias: this.options.alias,
    id: dep,
    parent: parent
  }, this)
}

Enfold.prototype._filter = function (file) {
  return !(
      (this.options.target === 'node' && nodeResolver.isCore(file)) ||
      (this.options.filter && !this.options.filter(file)))
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
    var target = this._resolve(dep, file)
    if (this._filter(target)) {
      resolved[dep] = target
    }
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

Enfold.prototype._readFile = function (file) {
  var contents
  if (has(this._files, file)) {
    contents = this._files[file]
    if (contents !== null) {
      return contents
    }
  }

  contents = fs.readFileSync(file, 'utf8')
  this._files[file] = contents
  this._fileExists[file] = true
  return contents
}

Enfold.prototype._isFile = function (file) {
  if (has(this._fileExists, file)) {
    return this._fileExists[file]
  }

  var isFile = false
  try {
    var stat = fs.statSync(file)
    isFile = stat.isFile() || stat.isFIFO()
  } catch (e) {
    if (!e && e.code !== 'ENOENT') {
      throw e
    }
  }

  this._fileExists = isFile
  return isFile
}
