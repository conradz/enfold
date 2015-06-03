var estraverse = require('estraverse')
var keys = require('lodash/object/keys')
var map = require('lodash/collection/map')
var sortBy = require('lodash/collection/sortBy')
var indexOf = require('lodash/array/indexOf')
var findRequire = require('./findRequire')

module.exports = link

function link (graph) {
  var items = sortBy(keys(graph.include))
  var entry = map(graph.entry, findId)
  var include = map(items, linkItem)
  return { entry: entry, include: include }

  function findId (file) {
    return indexOf(items, file)
  }

  function linkItem (file, id) {
    var item = graph.include[file]
    return {
      file: file,
      id: id,
      ast: estraverse.replace(item.ast, { enter: replace })
    }

    function replace (node) {
      var r = findRequire(node)
      if (r === undefined) {
        return undefined
      }

      var dep = item.dependencies[r]
      var id = findId(dep)
      if (id === -1) {
        return undefined
      }

      return {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [
          { type: 'Literal', value: id }
        ]
      }
    }
  }
}
