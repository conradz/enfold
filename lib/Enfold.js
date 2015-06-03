var Promise = require('bluebird')
var defaults = require('lodash/object/defaults')
var has = require('lodash/object/has')
var parse = require('./parse')

module.exports = Enfold

function Enfold (options) {
  this.options = defaults({
    target: 'node',
    parse: parse,
    entry: [],
    alias: null
  }, options)

  this._parsed = {}
}

Enfold.prototype._parse = function (file) {
  if (!has(this._parsed, file)) {
    var parse = this.options.parse
    this._parsed[file] = new Promise(function (resolve, reject) {
      parse(file, function (err, ast) {
        if (err) {
          return reject(err)
        }
        return resolve(ast)
      })
    })
  }

  return this._parsed[file]
}
