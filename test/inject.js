var inject = require('../lib/inject')
var acorn = require('acorn')
var escodegen = require('escodegen')
var test = require('tap').test

test('create copy of ast', function (t) {
  var ast = acorn.parse('process.nextTick()')
  var result = inject(ast)
  t.notEqual(ast, result)
  t.deepEqual(ast, acorn.parse('process.nextTick()'))
  t.end()
})

test('require process', function (t) {
  var ast = acorn.parse('process.nextTick()')
  ast = inject(ast)
  t.equal(escodegen.generate(ast), 'require(\'process\').nextTick();')
  t.end()
})

test('require buffer', function (t) {
  var ast = acorn.parse('Buffer.concat([])')
  ast = inject(ast)
  t.equal(escodegen.generate(ast), 'require(\'buffer\').Buffer.concat([]);')
  t.end()
})

test('constant dirname', function (t) {
  var ast = acorn.parse('console.log(__dirname)')
  ast = inject(ast, 'src/file.js')
  t.equal(escodegen.generate(ast), 'console.log(\'src\');')
  t.end()
})

test('constant filename', function (t) {
  var ast = acorn.parse('console.log(__filename)')
  ast = inject(ast, 'src/file.js')
  t.equal(escodegen.generate(ast), 'console.log(\'src/file.js\');')
  t.end()
})

test('global', function (t) {
  var ast = acorn.parse('global.alert("test")')
  ast = inject(ast)
  t.equal(escodegen.generate(ast),
    "(typeof global !== 'undefined' ? global " +
    ": typeof window !== 'undefined' ? window " +
    ": typeof self !== 'undefined' ? self : {})" +
    ".alert('test');")
  t.end()
})

test('inline process.env variables', function (t) {
  process.env.TEST_VAR = 'test env'

  var ast = acorn.parse('process.env.TEST_VAR')
  ast = inject(ast)
  t.equal(escodegen.generate(ast), "'test env';")
  t.end()
})
