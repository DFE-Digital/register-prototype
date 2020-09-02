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

filters.getStatusText = (data) => {
  if (!data) return "Not started"
  if (data.status) return data.status
  else return "In progress"
}

filters.getStatusClass = (status) => {
  switch (status) {
    // States that currently use the default tag style
    // - 'Enrolled'
    // - 'Conditions met'
    // - 'Conditions not met'
    // - 'Completed'

    // Application phases
    case 'Not started':
      return 'govuk-tag--grey'
    case 'In progress':
      return 'govuk-tag--grey'
    case 'Completed':
      return 'govuk-tag--blue'
  }
}

filters.sectionIsInProgress = data =>{
  return (data)
}

filters.sectionIsCompleted = data =>{
  return (data && data.status == "Completed")
}

filters.reviewIfInProgress = (url, data) => {
  if (!filters.sectionIsInProgress(data)){
    return url
  }
  else return url + "/confirm"
}


// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters
