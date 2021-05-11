// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _ = require('lodash')
const trainingRouteData = require('./../data/training-route-data')
const trainingRoutes = trainingRouteData.trainingRoutes
const utils = require('./../lib/utils')
const arrayFilters = require('./arrays.js').filters

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

// Prepend with 'Other grade:' if grade isn’t a pre-set type
filters.prettifyDegreeGrade = grade => {
  if (!grade) return ""
  let isOtherGrade = ![
    "First-class honours",
    "Upper second-class honours (2:1)",
    "Lower second-class honours (2:2)",
    "Third-class honours",
    "Pass"
  ].includes(grade)
  return (isOtherGrade) ? `Other grade: ${grade.toLowerCase()}` : grade
}

// Metadata about a school as a string
// URN 1234567, City, Postcode
filters.getSchoolHint = (school) => {
  let hint = `URN ${school.urn}`
  if (school.town) hint += `, ${school.town}` // Not all schools have cities
  if (school.postcode) hint += `, ${school.postcode}` // Not all schools have postcodes
  return hint
}

// Map school names so we get the hint in grey on a second line
filters.getSchoolNamesForAutocomplete = (schools) => {
  return schools.map(school => {
    return [`${school.schoolName} | ${filters.getSchoolHint(school)}`, school.uuid]
  })
}



// Biology (J482)
filters.getCourseNamesForSelect = (courses) => {
  return courses.map(course => {
    return [`${utils.getCourseName(course)}`, course.id]
  })
}

// Map course names so in autocomplete we get the name with
// a hint on a second line
// Biology (J482)
// QTS with PGCE full-time
filters.getCourseNamesForAutocomplete = (courses) => {
  return courses.map(course => {
    return [`${utils.getCourseName(course)} | ${course.qualificationsSummary}`, course.id]
  })
}

// Combine type with abbreviation if abbreviation is different
// The autocomplete will split these and make the abbreviation
// display in bold
// 
// Bachelor of Science (BSc)
filters.getDegreeTypesForAutocomplete = (degreeTypes) => {
  return degreeTypes.map(type => {
    let suggestion
    if (type.short == type.full) suggestion = type.full
    else suggestion = `${type.text} | ${type.short}`
    return {
      value: type.text, // The text that’s ultimately submitted / stored
      suggestion
    }
  })
}

// Return a pretty name for the degree
filters.getDegreeName = (degree) => {
  if (!degree) return ''

  let typeText

  if (utils.falsify(degree.isInternational)){
    if (degree.type == 'UK ENIC not provided'){
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

filters.includes = (route, string) =>{
  if (route && route.includes(string)) {
    return true
  } else {
    return false
  }
}

exports.filters = filters
