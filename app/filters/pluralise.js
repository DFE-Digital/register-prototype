// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const pluralize = require('pluralize')

// Leave this filters line
var filters = {}


/*
  ====================================================================
  filterName
  --------------------------------------------------------------------
  Short description for the filter
  ====================================================================

  Usage:

  [Usage here]

  filters.sayHi = (name) => {
    return 'Hi ' + name + '!'
  }

*/

// https://www.npmjs.com/package/pluralize
filters.pluralise = (content, ...args) => {
  pluralize.addSingularRule(/lens$/i, 'lens')
  pluralize.addPluralRule(/lens$/i, 'lenses')
  pluralize.addPluralRule(/correspondence$/i, 'correspondence')
  return pluralize(content, ...args)
}


// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters
