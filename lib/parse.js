var fs = require('fs')
var acorn = require('acorn')

module.exports = parse

function parse (file) {
  var src = fs.readFileSync(file, 'utf8')
  var ast = acorn.parse(src, { locations: true, sourceFile: file })
  return { source: src, ast: ast }
}
