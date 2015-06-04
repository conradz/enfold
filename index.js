var Enfold = require('./lib/Enfold')

module.exports = enfold

function enfold (opts, cb) {
  var bundle = new Enfold(opts)
  bundle.pack(opts.entry, cb)
}
