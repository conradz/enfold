var fs = require('fs')
var acorn = require('acorn')
var map = require('lodash/collection/map')
var prelude = fs.readFileSync(require.resolve('./prelude'), 'utf8')

module.exports = pack

function pack (graph) {
  var program = acorn.parse(prelude)
  var call = program.body[0].expression
  call.arguments[0] = {
    type: 'ArrayExpression',
    elements: map(graph.entry, makeLiteral)
  }
  call.arguments[1] = {
    type: 'ArrayExpression',
    elements: map(graph.include, createModule)
  }

  return program
}

function makeLiteral (value) {
  return { type: 'Literal', value: value }
}

function createModule (item) {
  return {
    type: 'FunctionExpression',
    id: null,
    params: [
      { type: 'Identifier', name: '__require__' },
      { type: 'Identifier', name: 'module' },
      { type: 'Identifier', name: 'exports' }
    ],
    body: {
      type: 'BlockStatement',
      body: item.ast.body
    }
  }
}
