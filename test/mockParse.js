var acorn = require('acorn')
var has = require('lodash/object/has')

module.exports = mockParse

function mockParse (files) {
  files = files || {}

  function parse (file, cb) {
    if (!has(files, file)) {
      return cb(new Error('invalid file'))
    }

    var ast
    try {
      ast = acorn.parse(files[file])
    } catch(e) {
      return cb(e)
    }

    return cb(null, ast)
  }

  parse.set = function (file, contents) {
    files[file] = contents
  }

  parse.remove = function (file) {
    delete files[file]
  }

  return parse
}
