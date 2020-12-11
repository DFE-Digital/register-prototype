// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _ = require('lodash')
const trainingRouteData = require('./../data/training-route-data')
const trainingRoutes = trainingRouteData.trainingRoutes
const recordUtils = require('./../lib/record')

// Leave this filters line
var filters = {}

// Return whether a record has a first or last name
filters.hasName = (record) => {
  return (record?.personalDetails?.givenName || record?.personalDetails?.familyName)
}

// Return "Firstname Lastname"
// Likely no longer needed - done with a getter now
filters.getShortName = ({
  givenName="",
  familyName=""} = false) => {
  let names = []
  names.push(givenName)
  names.push(familyName)
  return names.filter(Boolean).join(' ')
}

// Return "Lastname, Firstname"
filters.getShortNameReversed = ({
  givenName="",
  familyName=""} = false) => {
  let names = []
  names.push(familyName)
  names.push(givenName)
  return names.filter(Boolean).join(', ')
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

// Sort by last name or draft record
filters.sortRecordsByLastName = recordUtils.sortRecordsByLastName

// Sort by subject, including course code
filters.sortPublishCourses = courses => {
  let sorted = courses.sort((a, b) => {
    let aString = `${a.subject} (${a.code})`
    let bString = `${b.subject} (${b.code})`
    return recordUtils.sortAlphabetical(aString, bString)
  })
  return sorted
}

// Map course names so in autocomplete we get:
// Subject (code)
// Route
filters.getCourseNamesForAutocomplete = (courses) => {
  return courses.map(course => {
    // return [`${course.subject} (${course.code}) | ${course.route}`, course.id]
    return [`${course.subject} (${course.code})`, course.id]
  })
}

// Look up a record using it's UUID
filters.getRecordById = recordUtils.getRecordById

// Look up several records using array of  UUIDs
filters.getRecordsById = recordUtils.getRecordsById

exports.filters = filters
