// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _ = require('lodash')
const trainingRouteData = require('./../data/training-route-data')
const trainingRoutes = trainingRouteData.trainingRoutes
const utils = require('./../lib/utils')

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

// eg Biology (J482)
filters.getCourseName = (course) => {
  return `${course.subject} (${course.code})`
}

// Biology (J482)
filters.getCourseNamesForSelect = (courses) => {
  return courses.map(course => {
    return [`${filters.getCourseName(course)}`, course.id]
  })
}

// Map course names so in autocomplete we get the name with
// a hint on a second line
// Biology (J482)
// QTS with PGCE full-time
filters.getCourseNamesForAutocomplete = (courses) => {
  return courses.map(course => {
    return [`${filters.getCourseName(course)} | ${course.qualificationsSummary}`, course.id]
  })
}

// Return a pretty name for the degree
filters.getDegreeName = (degree) => {
  if (!degree) return ''

  let typeText

  if (utils.falsify(degree.isInternational)){
    if (degree.type == 'NARIC not provided'){
      typeText = "Non-UK degree"
    }
    else typeText = `Non-UK ${degree.type}`
  }
  else {
    typeText = degree.type
  }
  return `${typeText}: ${degree.subject.toLowerCase()}`
}

filters.getDegreeHint = (degree) =>{
  if (!degree) return ''
  if (utils.falsify(degree.isInternational)){
    return `${degree.country} (${degree.endDate})`
  }
  else {
    return `${degree.org} (${degree.endDate})`
  } 
}

exports.filters = filters
