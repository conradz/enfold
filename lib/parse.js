var fs = require('fs')
var acorn = require('acorn')

module.exports = parse

function parse (file, cb) {
  fs.readFile(file, 'utf8', read)

  function read (err, src) {
    if (err) {
      return cb(err)
    }

    var ast
    try {
      ast = acorn.parse(src, { locations: true, sourceFile: file })
    } catch (e) {
      return cb(e)
    }

    return cb(null, ast)
  }
}
