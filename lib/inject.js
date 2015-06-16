var path = require('path')
var estraverse = require('estraverse')
var filter = require('lodash/collection/filter')
var has = require('lodash/object/has')
var findImplicit = require('./findImplicit')
var clone = require('./clone')

module.exports = inject

function inject (ast, file) {
  ast = clone(ast)
  ast = injectEnv(ast)
  ast = injectGlobals(ast, file)
  return ast
}

function injectEnv (ast) {
  var env = process.env
  return estraverse.replace(ast, {
    enter: function (node) {
      if (node.type === 'MemberExpression' &&
        node.property.type === 'Identifier' &&
        !node.computed &&
        node.object.type === 'MemberExpression' &&
        node.object.object.type === 'Identifier' &&
        !node.object.computed &&
        node.object.object.name === 'process' &&
        node.object.property.type === 'Identifier' &&
        node.object.property.name === 'env') {
        var name = node.property.name
        if (has(env, name)) {
          return { type: 'Literal', value: env[name].toString(), loc: node.loc }
        } else {
          return { type: 'Identifier', name: 'undefined', loc: node.loc }
        }
      }
    }
  })
}

function injectGlobals (ast, file) {
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
    return requireBuffer()
  } else if (node.name === 'process') {
    return requireProcess()
  } else if (node.name === '__dirname') {
    return dirname(file)
  } else if (node.name === '__filename') {
    return filename(file)
  } else if (node.name === 'global') {
    return global()
  }
}

function requireBuffer () {
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

function requireProcess () {
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
