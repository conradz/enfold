var Enfold = require('./lib/Enfold')

module.exports = enfold

function enfold (opts) {
  var bundle = new Enfold(opts)
  return bundle.pack(opts.entry)
}

enfold.Enfold = Enfold
