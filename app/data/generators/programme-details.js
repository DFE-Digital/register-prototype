
const moment = require('moment')
const weighted = require('weighted')
const faker   = require('faker')
faker.locale  = 'en_GB'
const trainingRouteData = require('./../training-route-data')
const ittSubjects = require('./../itt-subjects')
const courses           = require('./../courses.json')

const publishRoutes = [
  'School direct salaried',
  'School direct tuition fee',
  'Apprenticeship PG',
  'Provider-led'
]

const generateCourseDetails = require('./course-details')

module.exports = (params, application) => {

  // Arwkwardly work out if this should be a publish course
  // Todo: could this be rewritten?
  let isPublishCourse
  let programmeDetails

  if (params?.programmeDetails?.isPublishCourse !== undefined){
    isPublishCourse = params.programmeDetails.isPublishCourse
  }
  else isPublishCourse = publishRoutes.includes(application.route)

  // If a publish course, pick from seed courses
  if (isPublishCourse) {
    // Grab programme details from seed courses
    let providerCourses = courses[application.provider].courses.filter(course => course.route == application.route)

    // Todo: seed courses for a provider might not align with selected or enabled routes. 
    // Think of a better way of handling this
    if (!providerCourses.length) {
      console.log(`No courses found for ${application.route} for ${application.provider}. Using all routes`)
      providerCourses = courses[application.provider].courses
    }
    // Pick a random course
    programmeDetails = faker.helpers.randomize(providerCourses)
  }
  else {
    // Generate some seed data
    let programmeDetailsOptions = {
      route: application.route, 
      startYear: application.academicYear,
      isPublishCourse // Implicitly false
    }

    programmeDetails = generateCourseDetails(programmeDetailsOptions)
  }

  return programmeDetails
}
