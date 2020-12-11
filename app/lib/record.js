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

// Sort two things alphabetically. Not case sensitive.
exports.sortAlphabetical = (x, y) => {
  if(x.toLowerCase() !== y.toLowerCase()) {
    x = x.toLowerCase();
    y = y.toLowerCase();
  }
  return x > y ? 1 : (x < y ? -1 : 0);
}

// Sort by last name or draft record
exports.sortRecordsByLastName = records => {
  let sorted = records.sort((a, b) => {
    let aString = `${a?.personalDetails?.familyName}` || 'Draft record'
    let bString = `${b?.personalDetails?.familyName}` || 'Draft record'
    return exports.sortAlphabetical(aString, bString)
  })
  return sorted
}

// Look up a record using it's UUID
exports.getRecordById = (records, id) => {
  let index = records.findIndex(record => record.id == id)
  return records[index]
}

// Look up several records using UUID
exports.getRecordsById = (records, array) => {
  array = [].concat(array) // force to array
  let filtered = records.filter(record => {
    return array.includes(record.id)
  })
  return filtered
}
