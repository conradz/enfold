var path = require('path')
var estraverse = require('estraverse')
var filter = require('lodash/collection/filter')
var findImplicit = require('./findImplicit')

module.exports = inject

function inject (ast, file) {
  var refs = findImplicit(ast)
  refs = filter(refs, shouldReplace)

  return estraverse.replace(ast, {
    enter: function (node) {
      if (refs.indexOf(node) !== -1) {
        return replace(node, file)
      }
    }
  })
}

function shouldReplace (ref) {
  var name = ref.name
  return name === 'process' ||
    name === 'Buffer' ||
    name === '__dirname' ||
    name === '__filename' ||
    name === 'global'
}

function replace (node, file) {
  if (node.name === 'Buffer') {
    return buffer()
  } else if (node.name === 'process') {
    return process()
  } else if (node.name === '__dirname') {
    return dirname(file)
  } else if (node.name === '__filename') {
    return filename(file)
  } else if (node.name === 'global') {
    return global()
  }
}

function buffer () {
  return {
    type: 'MemberExpression',
    computed: false,
    object: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'require' },
      arguments: [ { type: 'Literal', value: 'buffer' } ]
    },
    property: { type: 'Identifier', name: 'Buffer' }
  }
}

function process () {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'require' },
    arguments: [ { type: 'Literal', value: 'process' } ]
  }
}

function dirname (file) {
  return {
    type: 'Literal',
    value: path.dirname(file)
  }
}

function filename (file) {
  return {
    type: 'Literal',
    value: file
  }
}

function global () {
  return {
    type: 'ConditionalExpression',
    test: {
      type: 'BinaryExpression',
      operator: '!==',
      left: {
        type: 'UnaryExpression',
        prefix: true,
        operator: 'typeof',
        argument: { type: 'Identifier', name: 'global' }
      },
      right: { type: 'Literal', value: 'undefined' }
    },
    consequent: { type: 'Identifier', name: 'global' },
    alternate: {
      type: 'ConditionalExpression',
      test: {
        type: 'BinaryExpression',
        operator: '!==',
        left: {
          type: 'UnaryExpression',
          prefix: true,
          operator: 'typeof',
          argument: { type: 'Identifier', name: 'window' }
        },
        right: { type: 'Literal', value: 'undefined' }
      },
      consequent: { type: 'Identifier', name: 'window' },
      alternate: {
        type: 'ConditionalExpression',
        test: {
          type: 'BinaryExpression',
          operator: '!==',
          left: {
            type: 'UnaryExpression',
            prefix: true,
            operator: 'typeof',
            argument: { type: 'Identifier', name: 'self' }
          },
          right: { type: 'Literal', value: 'undefined' }
        },
        consequent: { type: 'Identifier', name: 'self' },
        alternate: { type: 'ObjectExpression', properties: [] }
      }
    }
  }
}
