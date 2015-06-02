var estraverse = require('estraverse')

module.exports = dependencies

function dependencies (ast) {
  var deps = []
  estraverse.traverse(ast, { enter: scan })
  return deps

  function scan (node) {
    if (isRequire(node)) {
      deps.push(node.arguments[0].value)
      this.skip()
    }
  }
}

function isRequire (n) {
  return n.type === 'CallExpression' &&
      n.callee.type === 'Identifier' &&
      n.callee.name === 'require' &&
      n.arguments.length === 1 &&
      n.arguments[0].type === 'Literal' &&
      typeof n.arguments[0].value === 'string'
}
