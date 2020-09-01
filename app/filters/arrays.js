// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
var _ = require('lodash');
// Leave this filters line
var filters = {}


// Merge arrays or strings together in to an array
filters.combineArrays = (arr1=[], arr2=[]) => {
  if (_.isString(arr1)) arr1 = [arr1]
  if (_.isString(arr2)) arr2 = [arr2]
  return [...arr1, ...arr2]
}


/*
  ====================================================================
  push
  --------------------------------------------------------------------
  push an item in to an array. Returns the array
  ====================================================================

  Usage:

  {% set array = ['a','b','c'] | push('d') %}

  array == ['a','b','c','d']

*/

filters.push = (array, item) => {
  array.push(item)
  return array
}

filters.trimEach = input => {
  if (!input) return

  if (_.isArray(input)) return input.map( item => {
    if (_.isString(item)) return item.trim()
    else return item
  } )
  else if (_.isString(input)) return input.trim()
  else return input
}


// Remove empty items from arrays / coerce empty to false
// Returns false if no items remaining
filters.removeEmpty = items => {

  // Handle empty
  if (!items) return

  // Handle strings
  if (_.isString(items) ) {
    if (items != null && items !== '') return items
    else return
  }

  // Handle arrys
  if (_.isArray(items)){
    var output = items.filter( item => {
      return (item && (item !==""))
    })
    // Don't return emtpy arrays
    if (output.length) return output
    else return
  }
}


// Remove empty, false and null items from array
filters.cleanArray = (array) => {
  let newArray = filters.trimEach(array)
  newArray = filters.removeEmpty(newArray)
  return newArray
}





// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters
