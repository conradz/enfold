module.exports = findRequire

function findRequire (node) {
  return isRequire(node) ? node.arguments[0].value : undefined
}

function isRequire (n) {
  return n.type === 'CallExpression' &&
      n.callee.type === 'Identifier' &&
      n.callee.name === 'require' &&
      n.arguments.length === 1 &&
      n.arguments[0].type === 'Literal' &&
      typeof n.arguments[0].value === 'string'
}
