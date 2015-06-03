var Enfold = require('./lib/Enfold')

module.exports = enfold

function enfold (entry, cb) {
  var bundle = new Enfold()
  bundle.pack(entry, cb)
}
