// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
var _ = require('lodash');
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

// set attribute on object
filters.debug = (item) => {
  console.log('Debug', item)
  return item;
}


filters.falsify = (input) => {
  if (_.isNumber(input)) return input
  else if (input == false) return false
  if (_.isString(input)){
    let truthyValues = ['yes','true']
    let falsyValues = ['no', 'false']
    if (truthyValues.includes(input.toLowerCase())) return true
    else if (falsyValues.includes(input.toLowerCase())) return false
  }
  return input;
}

filters.addIndexCount = array => {

  array.forEach((item, index) =>{
    item.index = index
  })
  return array;
}

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters
