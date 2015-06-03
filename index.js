var escodegen = require('escodegen')
var walk = require('./lib/walk')
var link = require('./lib/link')
var pack = require('./lib/pack')
var Enfold = require('./lib/Enfold')

module.exports = enfold

function enfold (entry, cb) {
  var bundle = new Enfold()
  return walk(entry, bundle, walked)

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
