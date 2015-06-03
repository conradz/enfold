var escodegen = require('escodegen')
var eachAsync = require('each-async')
var defaults = require('lodash/object/defaults')
var has = require('lodash/object/has')
var uniq = require('lodash/array/uniq')
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
    alias: null
  })

  this._parsed = {}
  this._deps = {}
  this._resolved = {}
}

Enfold.prototype.pack = function (entry, cb) {
  this._walk(entry, walked.bind(this))

  function walked (err, graph) {
    if (err) {
      return cb(err)
    }

    graph = link(graph)
    var ast = pack(graph)
    var code = escodegen.generate(ast)
    return cb(null, code)
  }
}

Enfold.prototype._walk = function (entry, cb) {
  if (this._graph) {
    return cb(null, this._graph)
  }

  return walk(entry, this, walked.bind(this))

  function walked (err, graph) {
    if (err) {
      return cb(err)
    }

    this._graph = graph
    return cb(null, graph)
  }
}

Enfold.prototype._parse = function (file, cb) {
  if (has(this._parsed, file)) {
    return cb(null, this._parsed[file])
  }

  var parse = this.options.parse
  parse(file, parsed.bind(this))

  function parsed (err, ast) {
    if (err) {
      return cb(err)
    }

    ast = inject(ast, file)
    this._parsed[file] = ast
    return cb(null, ast)
  }
}

Enfold.prototype._dependencies = function (file, cb) {
  if (has(this._resolved, file)) {
    return cb(null, this._resolved[file])
  }

  var deps
  var resolvedDeps = {}
  this._parse(file, parsed.bind(this))

  function parsed (err, ast) {
    if (err) {
      return cb(err)
    }

    deps = dependencies(ast)
    eachAsync(uniq(deps), resolveDep.bind(this), resolved.bind(this))
  }

  function resolveDep (dep, i, cb) {
    var opts = {
      target: this.options.target,
      id: dep,
      parent: file
    }

    resolve(opts, function (err, result) {
      if (err) {
        return cb(err)
      }

      resolvedDeps[dep] = result
      return cb()
    })
  }

  function resolved (err) {
    if (err) {
      return cb(err)
    }

    this._deps[file] = deps
    this._resolved[file] = resolvedDeps
    return cb(null, resolvedDeps)
  }
}
