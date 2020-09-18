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

// Add name, value, id, idPrefix and checked attributes to GOVUK form inputs
// Generate the attributes based on the application ID and the section they’re in

// Copied from Apply, but modified to work with data directly

/* Usage: 
{{ govukCheckboxes({
  fieldset: {
    legend: {
      text: "Nationality",
      classes: "govuk-fieldset__legend--s"
    }
  },
  items: [
    {
      text: "British"
    },
    {
      text: "Irish"
    },
    {
      text: "Other"
    }
  ]
} | decorateAttributes(data, "data.nationality"))}}

Will populate name and id, and add value and checked for each item
*/

filters.decorateAttributes = (obj, data, value) => {

  // Map dot or bracket notation to path parts
  pathParts = _.toPath(value)
  // Path parts includes the string name of data, which we don't need
  let storedValue = _.get(data, [...pathParts].splice(1) )

  // Strip data from path as autodata store auto-adds it.
  if (pathParts[0] === 'data'){
    pathParts.shift(1)
  }

  if (obj.items !== undefined) {
    obj.items = obj.items.map(item => {
      if (item.divider) return item

      var checked = storedValue ? '' : item.checked
      var selected = storedValue ? '' : item.selected
      if (typeof item.value === 'undefined') {
        item.value = item.text
      }

      // If data is an array, check it exists in the array
      if (Array.isArray(storedValue)) {
        if (storedValue.indexOf(item.value) !== -1) {
          checked = 'checked'
          selected = 'selected'
        }
      } else {
        // The data is just a simple value, check it matches
        if (storedValue === item.value) {
          checked = 'checked'
          selected = 'selected'
        }
      }

      item.checked = (item.checked !== undefined) ? item.checked : checked
      item.selected = (item.selected !== undefined) ? item.selected : selected
      return item
    })

    obj.idPrefix = pathParts.join('-')
  } else {
    // Check for undefined because the value may exist and be intentionally blank
    if (typeof obj.value === 'undefined') {
      obj.value = storedValue
    }
  }
  obj.id = (obj.id) ? obj.id : pathParts.join('-')
  obj.name = (obj.name) ? obj.name: pathParts.map(s => `[${s}]`).join('')
  return obj
}

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters
