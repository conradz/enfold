var React = require('react')

var MyComponent = React.createClass({
  render: function () {
    return React.createElement('div', null, 'test content')
  }
})

var result = React.renderToStaticMarkup(React.createElement(MyComponent))
console.log(result)
