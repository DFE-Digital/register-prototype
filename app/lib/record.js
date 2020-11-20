// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _ = require('lodash')
const trainingRouteData = require('./../data/training-route-data')
const trainingRoutes = trainingRouteData.trainingRoutes


// Check if the course route has allocated places
exports.hasAllocatedPlaces = (record) => {
  let routeHasAllocatedPlaces = (_.get(trainingRoutes, `[${record.route}]hasAllocatedPlaces`) == true)
  let allocatedSubjects = trainingRouteData.allocatedSubjects
  let subjectIsAllocated = allocatedSubjects.includes(_.get(record, 'programmeDetails.subject'))
  return (routeHasAllocatedPlaces && subjectIsAllocated)
}

// Check if the course route requires this field
exports.requiresField = (record, fieldName) => {
  let route = _.get(record, "route")
  if (!route) {
    console.log("Missing route in requiresField")
    return false
  }
  let requiredFields = _.get(trainingRoutes, `${route}.fields`)
  return (requiredFields) ? requiredFields.includes(fieldName) : false
}

// Check if the course route requires this section
exports.requiresSection = (record, sectionName) => {
  let route = _.get(record, "route")
  if (!route) {
    console.log("No route provided, using default sections")
    let requiredSections = trainingRouteData.defaultSections
    return requiredSections.includes(sectionName)
  }
  let requiredSections = _.get(trainingRoutes, `${route}.sections`)
  return requiredSections.includes(sectionName)
}

