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

filters.getStatusText = function(data = {}, defaultNotStarted, defaultInProgress) {
  if (!data) return defaultNotStarted || "Not started"
  if (data.status) return data.status
  else return defaultInProgress || "In progress"
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
    case 'Review':
      return 'govuk-tag--pink'
    case 'In progress':
      return 'govuk-tag--grey'
    case 'Completed':
      return 'govuk-tag--blue'

    // Record statuses
    case 'Draft':
      return 'govuk-tag--grey'
    case 'Apply draft': // same as draft
      return 'govuk-tag--grey'
    case 'Pending TRN':
      return 'govuk-tag--turquoise'
    case 'TRN received':
      return 'govuk-tag--blue'
    case 'EYTS recommended':
      return 'govuk-tag--purple'
    case 'EYTS awarded':
      return
    case 'QTS recommended':
      return 'govuk-tag--purple'
    case 'QTS awarded':
      return
    case 'Deferred':
      return 'govuk-tag--yellow'
    case 'Withdrawn':
      return 'govuk-tag--red'
    case 'Apply':
      return 'govuk-tag--pink'
    case 'Manual':
      return 'govuk-tag--grey'
    default:
      return 'govuk-tag--blue'
  }
}

filters.sectionIsInProgress = data =>{
  return (data)
}

filters.sectionIsCompleted = data =>{
  let status = data?.status
  // if (status == "Completed" || status == "Review") return true
  if (status == "Completed") return true
  else return false
}

filters.reviewIfInProgress = (url, data, path) => {
  if (!filters.sectionIsInProgress(data)){
    return url
  }
  else {
    if (path) return path + '/confirm'
    else return url + "/confirm"
  }
}

// Insert a warning tag if the value of the data starts with **
filters.checkForInvalid = (data) => {
  const tagHtml = `
    <div class="govuk-!-margin-bottom-2">
      <strong class="govuk-tag govuk-tag--red">Invalid answer</strong>
    </div>`

  if (data?.html && data.html.startsWith('**')){
    data.html = `${tagHtml}${data.html.substring(2)}`
    return data
  }
  else if (data?.text && data.text.startsWith('**')){
    data.html = `${tagHtml}${data.text.substring(2)}`
    delete data.text
    return data
  }
  else return data
}

filters.canBeAmmended = status => {
  let statusesThatCanAmend = [
    'Draft',
    'Apply draft',
    'Pending TRN',
    'TRN received',
    'Deferred'
  ]
  return statusesThatCanAmend.includes(status)
}

filters.getCanRecommendForQts = status => {
  let statusesThatShowQtsTabs = [
    'TRN received'
  ]
  return statusesThatShowQtsTabs.includes(status)
}

filters.getCanDefer = status => {
  let statusesThatAllowDeferral = [
    'Pending TRN',
    'TRN received'
  ]
  return statusesThatAllowDeferral.includes(status)
}

filters.getCanReinstate = status => {
  let statusesThatAllowReinstating = [
    'Deferred'
  ]
  return statusesThatAllowReinstating.includes(status)
}

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters
