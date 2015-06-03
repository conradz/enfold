var escodegen = require('escodegen')
var walk = require('./lib/walk')
var link = require('./lib/link')
var pack = require('./lib/pack')

module.exports = enfold

function enfold (entry, cb) {
  return walk(entry, walked)

  function walked (err, graph) {
    if (err) {
      return cb(err)
    }

    graph = link(graph)
    var result = pack(graph)
    var code = escodegen.generate(result)
    return cb(null, code)
  }
}
