var acorn = require('acorn')

module.exports = parse

function parse (src, file) {
  return acorn.parse(src, { locations: true, sourceFile: file })
}
