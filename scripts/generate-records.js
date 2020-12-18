// To generate new records:

// node scripts/generate-records.js

// Re-run this script after generating new courses
const fs                = require('fs')
const path              = require('path')
const faker             = require('faker')
faker.locale            = 'en_GB'
const moment            = require('moment')
const _                 = require('lodash')
const trainingRouteData = require('../app/data/training-route-data')
const seedRecords       = require('../app/data/seed-records')
const statuses          = require('../app/data/status')
const courses           = require('../app/data/courses.json')

// Settings
let simpleGcseGrades    = true //output pass/fail rather than full detail
const activeProvider    = "University of Southampton"
const providerCourses   = courses[activeProvider].courses

const sortBySubmittedDate = (x, y) => {
  return new Date(y.submittedDate) - new Date(x.submittedDate);
}

const generateTrainingDetails = require('../app/data/generators/training-details')


// Route into teaching
const trainingRoutes = Object.keys(trainingRouteData.trainingRoutes)
const enabledTrainingRoutes = trainingRouteData.enabledTrainingRoutes
const generateProgrammeDetails = require('../app/data/generators/course-details')

const getRandomEnabledRoute = () => {
  return faker.helpers.randomize(enabledTrainingRoutes)
}

// Personal details
const generatePersonalDetails = require('../app/data/generators/personal-details')
const generateContactDetails = require('../app/data/generators/contact-details')
const generateDiversity = require('../app/data/generators/diversity')

// Education
const generateDegree = require('../app/data/generators/degree')
const generateGce = require('../app/data/generators/gce')
const generateGcse = require('../app/data/generators/gcse')

// Timeline
const generateEvents = require('../app/data/generators/events')

// Populate application data object with fake data
const generateFakeApplication = (params = {}) => {

  const status = params.status || faker.helpers.randomize(statuses)
  const events = generateEvents(faker, { status })



  let route = (params.route) ? params.route : undefined

  // NB: this will in effect overwrite the route
  let isPublishCourse
  if (params?.programmeDetails?.isPublishCourse !== undefined){
    if (params.programmeDetails.isPublishCourse == 'true'){
      isPublishCourse = true
    }
    else isPublishCourse = false
  }
  else isPublishCourse = faker.helpers.randomize([true, false])

  // Programme details
  let programmeDetails
  if (isPublishCourse) {
    // Grab programme details from seed courses
    programmeDetails = (params.programmeDetails === null) ? undefined : { ...faker.helpers.randomize(providerCourses), ...params.programmeDetails }
  }
  else {
    // Generate some seed data
    let programmeDetailsOptions = {
      route, 
      startYear: faker.helpers.randomize([2019,2020]),
      isPublishCourse: false
    }

    programmeDetails = (params.programmeDetails === null) ? undefined : { ...generateProgrammeDetails(programmeDetailsOptions), ...params.programmeDetails }
  }

  // Copy route back up - generator may have randomly picked one
  route = programmeDetails.route

  // Dates
  let updatedDate, submittedDate, deferredDate, withdrawalDate
  // Make sure updated date is after submitted date
  if (params.submittedDate){
    updatedDate = params.updatedDate || faker.date.between(
      moment(),
      moment(params.submittedDate))
  }
  else {
    // Updated at some point in last 500 days
    if (status == 'Draft'){
      updatedDate = params.updatedDate || faker.date.between(
      moment(),
      moment().subtract(50, 'days'))
    }
    else {
      updatedDate = params.updatedDate || faker.date.between(
      moment(),
      moment().subtract(500, 'days'))
    }
    
  }
  // Submitted some time before it was updated
  if (status != 'Draft'){
    submittedDate = params.submittedDate || faker.date.between(
    moment(updatedDate),
    moment().subtract(500, 'days'))
  }
  // If the status is Deferred 
  if (status === 'Deferred') {    
    // Make sure deferral date is between submitted and updated date
    deferredDate = params.deferredDate || faker.date.between(
      moment(submittedDate),
      moment(updatedDate))
  }
  // If the status is Withdrawn 
  if (status === 'Withdrawn') {    
    // Make sure withdrawal date is the same as the last updated date
    withdrawalDate = params.updatedDate
  }

  const trainingDetails = (params.trainingDetails === null) ? undefined : { ...generateTrainingDetails({submittedDate, status}), ...params.trainingDetails }

  // Personal details
  const personalDetails = (params.personalDetails === null) ? null : { ...generatePersonalDetails(faker), ...params.personalDetails }

  // Diversity
  const diversity = (params.diversity === null) ? undefined : { ...generateDiversity(faker), ...params.diversity }

  // Contact details
  const isInternationalTrainee = !(personalDetails.nationality.includes('British') || personalDetails.nationality.includes('Irish'))
  let person = Object.assign({}, personalDetails)
  person.isInternationalTrainee = isInternationalTrainee
  const contactDetails = (params.contactDetails === null) ? undefined : { ...generateContactDetails(faker, person), ...params.contactDetails }

  // Qualifications

  // GCSEs
  let gcse = (params.gcse === null) ? undefined : { ...generateGcse(faker, isInternationalTrainee, simpleGcseGrades), ...params.gcse }

  // A Levels - not used currently
  // qualifications.gce = (params.gce === null) ? undefined : generateGce(faker, isInternationalTrainee)

  // Degrees
  let degree = (params.degree === null) ? undefined : { ...generateDegree(faker, isInternationalTrainee), ...params.degree }
  
  let trn
  if (!status.includes('Draft') && !status.includes('Pending TRN')){
    trn = params.trn || faker.random.number({
      'min': 1000000,
      'max': 9999999
    })
  }
  
  return {
    id: params.id || faker.random.uuid(),
    route,
    status,
    trn,
    updatedDate,
    submittedDate,
    deferredDate,
    withdrawalDate,
    personalDetails,
    diversity,
    isInternationalTrainee,
    contactDetails,
    trainingDetails,
    programmeDetails,
    gcse,
    degree,
    events
  }
}

/**
 * Generate a number of fake applications
 *
 * @param {String} count Number of applications to generate
 *
 */
const generateFakeApplications = () => {
  let applications = []

  console.log({seedRecords})
  seedRecords.forEach(seedRecord => {
    applications.push(generateFakeApplication(seedRecord))
  })

  // Incomplete draft applications
  // for (var i = 0; i < 1; i++) {
  //   const application = generateFakeApplication({
  //     status: 'Draft',
  //     trainingDetails: {
  //       status: 'Completed'
  //     },
  //     programmeDetails: null,
  //     personalDetails: {
  //       status: 'Completed'
  //     },
  //     contactDetails: null,
  //     diversity: null,
  //     degree: null,
  //     route: getRandomEnabledRoute(),
  //     updatedDate: faker.date.between(
  //       moment(),
  //       moment().subtract(16, 'days'))
  //   })
  //   applications.push(application)
  // }

  // // Semi complete draft applications
  for (var i = 0; i < 1; i++) {
    const application = generateFakeApplication({
      status: 'Draft',
      trainingDetails: {
        status: 'Completed'
      },
      personalDetails: {
        status: 'Completed'
      },
      contactDetails: {
        status: 'Completed'
      },
      diversity: {
        status: 'Completed'
      },
      degree: null,
      route: getRandomEnabledRoute(),
      updatedDate: faker.date.between(
        moment(),
        moment().subtract(16, 'days'))
    })
    applications.push(application)
  }

  // Complete draft application
  // for (var i = 0; i < 1; i++) {
  //   const application = generateFakeApplication({
  //     status: 'Draft',
  //     personalDetails: {
  //       status: 'Completed'
  //     },
  //     contactDetails: {
  //       status: 'Completed'
  //     },
  //     diversity: {
  //       status: 'Completed'
  //     },
  //     gcse: {
  //       status: 'Completed'
  //     },
  //     degree: {
  //       status: 'Completed'
  //     },
  //     programmeDetails: {
  //       status: 'Completed'
  //     },
  //     route: getRandomEnabledRoute(),
  //     updatedDate: faker.date.between(
  //       moment(),
  //       moment().subtract(1, 'days'))
  //   })
  //   applications.push(application)
  // }

  // // Submitted applications
  for (var i = 0; i < 5; i++) {
    let updatedDate = faker.date.between(
        moment(),
        moment().subtract(6, 'days'))
    const application = generateFakeApplication({
      status: 'Pending TRN',
      updatedDate,
      route: getRandomEnabledRoute(),
      submittedDate: updatedDate
    })
    applications.push(application)
  }

  for (var i = 0; i < 5; i++) {
    const application = generateFakeApplication({
      status: 'TRN received',
      route: getRandomEnabledRoute(),
      updatedDate: faker.date.between(
        moment().subtract(2, 'days'),
        moment().subtract(6, 'days'))
    })
    applications.push(application)
  }

  for (var i = 0; i < 15; i++) {
    const application = generateFakeApplication({
      status: 'TRN received',
      route: getRandomEnabledRoute(),
      updatedDate: faker.date.between(
        moment().subtract(2, 'days'),
        moment().subtract(600, 'days'))
    })
    applications.push(application)
  }

  for (var i = 0; i < 10; i++) {
    const application = generateFakeApplication({
      status: 'QTS recommended',
      route: getRandomEnabledRoute(),
      updatedDate: faker.date.between(
        moment().subtract(400, 'days'),
        moment().subtract(600, 'days'))
    })
    applications.push(application)
  }

  // Submitted applications
  for (var i = 0; i < 15; i++) {
    const application = generateFakeApplication({
      status: 'QTS awarded',
      route: getRandomEnabledRoute(),
      updatedDate: faker.date.between(
        moment().subtract(300, 'days'),
        moment().subtract(800, 'days'))
    })
    applications.push(application)
  }

  // Submitted applications
  for (var i = 0; i < 3; i++) {
    const application = generateFakeApplication({
      status: 'Withdrawn',
      route: getRandomEnabledRoute(),
      updatedDate: faker.date.between(
        moment().subtract(50, 'days'),
        moment().subtract(300, 'days'))
    })
    applications.push(application)
  }

  // Submitted applications
  for (var i = 0; i < 3; i++) {
    const application = generateFakeApplication({
      status: 'Deferred',
      route: getRandomEnabledRoute(),
      updatedDate: faker.date.between(
        moment().subtract(50, 'days'),
        moment().subtract(300, 'days'))
    })
    applications.push(application)
  }



  // Generate random other applications for all routes including those
  // not enabled
  for (var i = 0; i < 100; i++) {
    let nonDraftStatuses = statuses.filter(status => status != 'Draft')
    const application = generateFakeApplication({
      route: faker.helpers.randomize(trainingRoutes),
      status: faker.helpers.randomize(nonDraftStatuses)
    })
    applications.push(application)
  }


  applications = applications.sort(sortBySubmittedDate)

  return applications
}

/**
 * Generate JSON file
 *
 * @param {String} filePath Location of generated file
 * @param {String} count Number of applications to generate
 *
 */
const generateApplicationsFile = (filePath) => {
  const applications = generateFakeApplications()
  console.log(`Generated ${applications.length} fake records`)
  const filedata = JSON.stringify(applications, null, 2)
  fs.writeFile(
    filePath,
    filedata,
    (error) => {
      if (error) {
        console.error(error)
      }
      console.log(`Application data generated: ${filePath}`)
    }
  )
}

generateApplicationsFile(path.join(__dirname, '../app/data/records.json'))
