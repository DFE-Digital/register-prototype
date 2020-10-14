// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _ = require('lodash')
const trainingRoutes = require('./../data/training-routes')

// Leave this filters line
var filters = {}

// Return firstname + lastname
// Likely no longer needed - done with a getter now
filters.getShortName = ({
  givenName="", 
  familyName=""} = false) => {
  let names = []
  names.push(givenName)
  names.push(familyName)
  return names.filter(Boolean).join(' ')
}

// Return full name with middle names if present
// Likely no longer needed - done with a getter now
filters.getFullName = ({
  givenName="", 
  middleNames="", 
  familyName=""} = false) => {
  let names = []
  names.push(givenName)
  names.push(middleNames)
  names.push(familyName)
  return names.filter(Boolean).join(' ')
}

// Adds referrer as query string if it exists
filters.addReferrer = (url, referrer) => {
  if (!referrer || referrer == 'undefined') return url
  else {
    return `${url}?referrer=${referrer}`
  }
}

filters.orReferrer = (url, referrer) => {
  if (!referrer || referrer == 'undefined') return url
  else {
    return referrer
  }
}

// Check if the course route requires this section
filters.requiresSection = (record, sectionName) => {
  let route = _.get(record, "route")
  if (!route) {
    console.log("Missing route in requiresSection")
    return false
  }
  let requiredSections = _.get(trainingRoutes, `${route}.sections`)
  return requiredSections.includes(sectionName)
}

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters
