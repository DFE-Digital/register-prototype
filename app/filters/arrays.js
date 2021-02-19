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


filters.isArray = arr => {
  let isArray = _.isArray(arr)
  return _.isArray(arr)
}

filters.uniq = arr => {
  return [...new Set(arr || [])]
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

const joinArray = (array, options={}) => {

  var defaults = {
    delimiter: ', ',
    append: '',
    prepend: ''
  }

  // Duck-type check for direct Nunjucks macro returns

  // Macro object string
  if (typeof array == 'object' && 'toString' in array && !_.isArray(array)) {
    console.log('Error in joinArray: not a string or array', array)
  }

  // Array contains object string
  if(_.isArray(array)){
    array.forEach (item => {
      if (typeof item == 'object' && 'toString' in item) {
        console.log('Error in joinArray: not a string or array', array)
      }
    })
  }

  // Deal with strings
  if (_.isString(array)) {
    array = [array]
  }
  if (_.isString(options)) options = {delimiter: options}

  // Merge options and defaults
  options = Object.assign({}, defaults, options)
  // Set to be options.delimiter if it doesn't already exist
  options.lastDelimiter = options.lastDelimiter || options.delimiter

  // Strip trailing space from delimiters and add breaks
  if (options.newlines){
    options.delimiter = options.delimiter.replace(/\s+$/g, '') + "\n"
    options.lastDelimiter = options.lastDelimiter.replace(/\s+$/g, '') + "\n"
  }

  // console.log('Input array is', array)
  // Clean up array
  array = filters.cleanArray(array)
  if (!_.isArray(array)) return

  // Don't output anything if no array or items
  if (!array || array.length == 0) return // return nothing if no items

  // No delimiters if only one item
  if (array.length == 1) {
    // console.log(array[0])
    return options.prepend + array[0] + options.append // just return item
  }

  // Create string
  // console.log(array)
  var last = array.pop();
  return options.prepend + array.join(options.delimiter) + options.lastDelimiter + last + options.append;
}

filters.joinArray = joinArray

// A, B, C and D
filters.joinify = (items) => filters.joinArray(items, {delimiter:', ', lastDelimiter: ' and '})

// A, B, C, and D
filters.oxfordComma = (items) => filters.joinArray(items, {delimiter:', ', lastDelimiter: ', and '})

//  A, B, C, D
filters.commaSeparate = (items) => filters.joinArray(items, {delimiter:', '})

//  A,
//  B,
//  C,
//  D
filters.commaSeparateLines = (items) => filters.joinArray(items, {delimiter:', ', newlines: true })

filters.separateLines = (items) => filters.joinArray(items, {delimiter:' ', newlines: true })

// A and B and C and D
filters.andSeparate = (items)=> filters.joinArray(items, {delimiter: ' and '})

// A B C D
filters.spaceSeparate = (items) => filters.joinArray(items, {delimiter:' '})

// A. B. C. D.
filters.joinAsSentences = (items) => filters.joinArray(items, {delimiter:'. ', append: '.'})


filters.removeArrayItem = (array, itemToRemove) =>{
  if (_.isArray(array)){
    return filteredItems = array.filter(item => item != itemToRemove)
  }
  else return array
}

filters.removeArrayItems = (array, itemsToRemove) =>{
  if (_.isArray(array)){
    return filteredItems = array.filter(item => !itemsToRemove.includes(item))
  }
  else return array
}

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters
