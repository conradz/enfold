var estraverse = require('estraverse')
var findRequire = require('./findRequire')

module.exports = dependencies

function dependencies (ast) {
  var deps = []
  estraverse.traverse(ast, { enter: scan })
  return deps

  function scan (node) {
    var r = findRequire(node)
    if (r !== undefined) {
      deps.push(r)
      this.skip()
    }
  }
}
