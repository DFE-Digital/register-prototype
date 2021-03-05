
const moment = require('moment')
const weighted = require('weighted')
const faker   = require('faker')
faker.locale  = 'en_GB'
const trainingRouteData = require('./../training-route-data')
const ittSubjects = require('./../itt-subjects')
const courses           = require('./../courses.json')

const publishRoutes = trainingRouteData.publishRoutes

const generateCourse = require('./course-generator')

module.exports = (params, application) => {

  // Arwkwardly work out if this should be a publish course
  // Todo: could this be rewritten?
  let isPublishCourse
  let courseDetails

  if (params?.courseDetails?.isPublishCourse !== undefined){
    isPublishCourse = params.courseDetails.isPublishCourse
  }
  else isPublishCourse = publishRoutes.includes(application.route)

  // If a publish course, pick from seed courses
  if (isPublishCourse) {
    // Grab course details from seed courses
    let providerCourses = courses[application.provider].courses.filter(course => course.route == application.route)

    // Todo: seed courses for a provider might not align with selected or enabled routes. 
    // Think of a better way of handling this
    if (!providerCourses.length) {
      console.log(`No courses found for ${application.route} for ${application.provider}. Using all routes`)
      providerCourses = courses[application.provider].courses
    }
    // Pick a random course
    courseDetails = faker.helpers.randomize(providerCourses)
  }
  else {
    // Generate some seed data
    let courseDetailsOptions = {
      route: application.route, 
      startYear: application.academicYear,
      isPublishCourse // Implicitly false
    }

    courseDetails = generateCourse(courseDetailsOptions)
  }

  return courseDetails
}
