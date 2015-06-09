var acorn = require('acorn')
var has = require('lodash/object/has')

module.exports = mockParse

function mockParse (files) {
  files = files || {}

  function parse (file) {
    if (!has(files, file)) {
      throw new Error('invalid file')
    }

    var source = files[file]
    return {
      source: source,
      ast: acorn.parse(files[file])
    }
  }

  parse.set = function (file, contents) {
    files[file] = contents
  }

  parse.remove = function (file) {
    delete files[file]
  }

  return parse
}
