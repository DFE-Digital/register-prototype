
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

  const isNonDraft = utils.isNonDraft(application)
  const isApplyDraft = (application.source == 'Apply' && application.status == "Apply draft")
  const isManualDraft = (application.source == 'Draft' && application.status == "Draft")
  
  const sectionIsComplete = (params?.courseDetails?.status == "Completed")

  // Whether to pretend that missing or ambiguous data hase already been set
  // If something is non draft or complete then implicitly the ambiguous data must have been fixed.
  let pretendDataIsComplete = ( isNonDraft || isManualDraft || sectionIsComplete )

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

    // For each Publish subject, set course subjects where they’re mappable.
    // Not all subjects are mappable. Users will use UI to map them. Where we're pretending the data
    // is complete we pick a random subject - as if the user had preivously picked that.
    courseDetails = setSubjectSpecialisms(courseDetails, pretendDataIsComplete)

    // Some Pubish courses are set to `Full time or part time` - when a user adds one of these
    // courses we’ll assume `Full time` but let the user override it. 
    if (pretendDataIsComplete && courseDetails.studyMode == "Full time or part time"){
      courseDetails.studyMode = "Full time"
    }

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
