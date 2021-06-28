
const moment = require('moment')
const weighted = require('weighted')
const faker   = require('faker')
faker.locale  = 'en_GB'
const trainingRouteData = require('./../training-route-data')
const ittSubjects = require('./../itt-subjects')
const courses           = require('./../courses.json')
const utils = require('./../../lib/utils.js')


const publishSubjects = ittSubjects.publishSubjects

const publishRoutes = trainingRouteData.publishRoutes

const generateCourse = require('./course-generator')

// TODO: this code is nearly identical to mapMappablePublishSubjects() in utils.js - they
// should probably be combined together
const setSubjectSpecialisms = (courseDetails, pickRandom) => {

  courseDetails.subjects = {}

  Object.keys(courseDetails.publishSubjects).forEach(ordinal => {

    let theSubject = courseDetails.publishSubjects[ordinal]

    // Custom handling for primary courses
    // Publish stores them as a single subject, but we want to map them to up to 3 specialisms
    if (theSubject.includes("Primary")){

      let subjects = {}

      // First specialism is always primary teaching
      subjects.first = "Primary teaching"

      let randomLanguage = faker.helpers.randomize(['French language', 'Spanish language', 'German language', 'Modern languages'])

      switch(theSubject){
        case "Primary with English":
          subjects.second = "English studies"
          break
        case "Primary with physical education":
          if (pickRandom){
            subjects.second = "Sport and exercise sciences"
            courseDetails.publishSubjects.second = "Physical education"
          }
          else subjects.second = null
          break
        case "Primary with science":
          subjects.second = "General sciences"
          break
        case "Primary with geography and history":
          subjects.second = "Geography"
          subjects.third = "History"
          break
        case "Primary with mathematics":
          // Primary with maths is treated specially - override the first subject to set this
          // specific specialism
          subjects.first = "Specialist teaching (primary with mathematics)"
          break
        case "Primary with modern languages":
          if (pickRandom) {
            subjects.second = randomLanguage
            courseDetails.publishSubjects.second = "Modern languages"
          }
          else subjects.second = null
          break
      }
      
      courseDetails.subjects = subjects

    }
    else {

      
      // Some publish subjects unambiguously map to a specialism
      // if so, set it directly
      if (publishSubjects[theSubject].specialism) {
        courseDetails.subjects[ordinal] = publishSubjects[theSubject].specialism
      }
      // Where the publish subject doesn't unambiguously map to a specialism,
      // then pick a random specialism
      else if (pickRandom) {
        let randomisedSubjects = faker.helpers.shuffle(publishSubjects[theSubject].subjectSpecialisms)
        courseDetails.subjects[ordinal] = randomisedSubjects[0]
      }
      else {
        courseDetails.subjects[ordinal] = null
      }

    }


  })

  return courseDetails

}





module.exports = (params, application) => {

  const isApplyDraft = (application.source == 'Apply' && application.status == "Apply draft")

  const sectionIsComplete = (params?.courseDetails?.status == "Completed")

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

    let limitedCourses = providerCourses.slice(0, 12) // to match data.settings.courseLimit

    // Pick a random course for this trainee
    courseDetails = faker.helpers.randomize(limitedCourses)

    // Whether to pretend that specialisms have already been set
    // Everything except apply drafts (all other statuses and manual drafts) should have specialisms
    // set - because by this point the provier user would have had to fill it in.
    // Apply drafts should only have specialisms set if the section is 'complete' - to simulate
    // trainees that are 'Ready to register'
    let pickRandom = ( !isApplyDraft || sectionIsComplete )

    courseDetails = setSubjectSpecialisms(courseDetails, pickRandom)



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
