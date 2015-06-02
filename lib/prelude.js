(function (entry, items) {
  var cache = new Array(items.length)

  function bundleRequire (id) {
    if (typeof id !== 'number') {
      return require(id)
    }

    if (!cache[id]) {
      create(id)
    }

    return cache[id].exports
  }

  function create (id) {
    var func = items[id]
    var module = {
      exports: {}
    }

    cache[id] = module
    func(bundleRequire, module, module.exports)
  }

  for (var i = 0; i < entry.length; i++) {
    bundleRequire(entry[i])
  }
})(
  [/* entry */],
  [/* items */]
)
