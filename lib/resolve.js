var path = require('path')
var nodeResolver = require('resolve')
var browserResolver = require('browser-resolve')
var has = require('lodash/object/has')
var shims = require('./shims')

module.exports = resolve

function resolve (options, cb) {
  var id = options.id
  var parent = options.parent
  if (typeof id !== 'string') {
    throw new Error('id is required')
  }
  if (typeof parent !== 'string') {
    throw new Error('parent is required')
  }

  if (options.alias) {
    id = alias(id, options.alias)
  }

  var target = options.target || 'browser'
  if (target === 'node') {
    return resolveNode(id, parent, cb)
  } else if (target === 'browser') {
    return resolveBrowser(id, parent, cb)
  } else {
    throw new Error('invalid target')
  }
}

function resolveNode (id, parent, cb) {
  var dir = path.dirname(parent)
  return nodeResolver(id, { basedir: dir }, cb)
}

function resolveBrowser (id, parent, cb) {
  return browserResolver(id, { filename: parent, modules: shims }, cb)
}

function alias (id, aliases) {
  var i = id.indexOf('/')
  if (i === -1) {
    return has(aliases, id) ? aliases[id] : id
  } else {
    var name = id.substr(0, i)
    return has(aliases, name) ? aliases[name] + '/' + id.substr(i + 1) : id
  }
}
