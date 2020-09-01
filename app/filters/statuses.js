// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------

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

filters.getStatusText = (completed, data) => {
  if (completed) return "Completed"
  else if (data) return "Started"
  else return "Not started"
}


// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters
