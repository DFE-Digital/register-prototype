// To generate new records:

// node scripts/generate-records.js

// Re-run this script after generating new courses
const fs                = require('fs')
const path              = require('path')
const faker             = require('faker')
faker.locale            = 'en_GB'
const moment            = require('moment')
const _                 = require('lodash')
const weighted          = require('weighted')

// Data
const trainingRouteData = require('../app/data/training-route-data')
const seedRecords       = require('../app/data/seed-records')
const statuses          = require('../app/data/status')
const courses           = require('../app/data/courses.json')
const providerData      = require('../app/data/providers.js')
const providers         = providerData.selectedProviders

// Settings
let simpleGcseGrades    = true //output pass/fail rather than full detail

// const yearsToGenerate   = [2016, 2017, 2018, 2019, 2020]
const yearsToGenerate = [2019, 2020]
const currentYear     = 2020

const sortBySubmittedDate = (x, y) => {
  return new Date(y.submittedDate) - new Date(x.submittedDate);
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// Random whole number
const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max))
}
// Random number between x and y
const getRandomArbitrary = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
}

// Training routes
const trainingRoutes = Object.keys(trainingRouteData.trainingRoutes)
const enabledTrainingRoutes = trainingRouteData.enabledTrainingRoutes
const enabledApplyRoutes = enabledTrainingRoutes.filter(route => trainingRouteData.applyRoutes.includes(route))
const getRandomEnabledRoute = () => faker.helpers.randomize(enabledTrainingRoutes)
const getRandomEnabledApplyRoute = () => faker.helpers.randomize(enabledApplyRoutes)

const getRandomRoute = (params) => {
  if (params?.source == 'Apply') return getRandomEnabledApplyRoute()
  else return getRandomEnabledRoute()
}

// Generators
const generateTrainingDetails = require('../app/data/generators/training-details')
const generateDates = require('../app/data/generators/dates')
const generateTrn = require('../app/data/generators/trn')
const generateCourseDetails = require('../app/data/generators/course-details')
const generatePersonalDetails = require('../app/data/generators/personal-details')
const generateContactDetails = require('../app/data/generators/contact-details')
const generateDiversity = require('../app/data/generators/diversity')
const generateDegree = require('../app/data/generators/degree')
const generateGce = require('../app/data/generators/gce')
const generateGcse = require('../app/data/generators/gcse')
const generateEvents = require('../app/data/generators/events')
const generatePlacement = require('../app/data/generators/placement')
const generateUndergraduateQualification = require('../app/data/generators/undergraduate-qualifications')
const generateSource = require('../app/data/generators/source')
const generateApplyData = require('../app/data/generators/apply-data')

// Populate application data object with fake data
const generateFakeApplication = (params = {}) => {

  let application = {}

  application.academicYear    = params.academicYear || currentYear
  application.diversity       = (params.diversity === null) ? undefined : { ...generateDiversity(), ...params.diversity }
  application.id              = params.id || faker.random.uuid()
  application.personalDetails = (params.personalDetails === null) ? undefined : { ...generatePersonalDetails(), ...params.personalDetails }
  application.provider        = params.provider || faker.helpers.randomize(providers)
  application.route           = (params.route === null) ? undefined : (params.route || getRandomRoute(params))
  application.status          = params.status || faker.helpers.randomize(statuses)
  
  if (application.status == "Deferred") {
    application.previousStatus = "TRN received" // set a state to go back to
  }

  // Needed in particular order

  // Dates
  application                  = { ...application, ...generateDates(params, application) }
  // Training
  application.trn              = (params.trn === null) ? undefined : (params.trn || generateTrn(application))

  application.courseDetails = (params.courseDetails === null) ? undefined : { ...generateCourseDetails(params, application), ...params.courseDetails }
  // There's a slight edge case that programme details might return with a different route - if so save it back up
  if (application?.courseDetails?.route && application.courseDetails.route != application.route){
    console.log("Overwriting route") // hacky, and hopefully doesn’t happen often
    application.route = application.courseDetails.route
  }
  application.source          = (params.source) ? params.source : generateSource(application)
  if (application.source == "Apply"){
    application.applyData = { ...generateApplyData(application), ...params.applyData}
    // if (params.applyData) application.applyData = params.applyData
  }
  application.events           = generateEvents(application)

  application.trainingDetails  = (params.trainingDetails === null) ? undefined : { ...generateTrainingDetails(application), ...params.trainingDetails }
  // Contact details
  application.isInternationalTrainee = !(application.personalDetails.nationality.includes('British') || application.personalDetails.nationality.includes('Irish'))
  application.contactDetails   = (params.contactDetails === null) ? undefined : { ...generateContactDetails(application), ...params.contactDetails } 
  // Education
  application.gcse             = (params.gcse === null) ? undefined : { ...generateGcse(application.isInternationalTrainee, simpleGcseGrades), ...params.gcse }
  // A Levels - not used currently
  // application.gce = (params.gce === null) ? undefined : generateGce(faker, isInternationalTrainee)
  
  let requiredSections = trainingRouteData.trainingRoutes[application.route].sections

  // Postgraduate qualification
  if (requiredSections.includes('degree')) {
    application.degree           = (params.degree === null) ? undefined : { ...generateDegree(application.isInternationalTrainee), ...params.degree } 
  }

  // Undergraduate Qualification
  if (requiredSections.includes('undergraduateQualification')) {
    application.undergraduateQualification           = (params.undergraduateQualification === null) ? undefined : { ...generateUndergraduateQualification(), ...params.undergraduateQualification }  
  }
  
  // Placements
  if (requiredSections.includes('placement')) {
    application.placement        = (params.placement === null) ? undefined : { ...generatePlacement(application), ...params.placement } 
  }

  // Make sure statuses match qualifications
  let routeQualifications = trainingRouteData.trainingRoutes[application.route].qualifications
  if (routeQualifications.includes('EYTS')) {  
    application.status = application.status.replace('QTS', 'EYTS')
  }

  return application

}

const generateFakeApplications = () => {

  let applications = []

  seedRecords.forEach(seedRecord => {
    // Hardcode provider and year
    // Todo - apply these back to seed records?
    let seed = {...seedRecord, ...{
      provider: "Coventry University",
      academicYear: currentYear
    }}
    applications.push(generateFakeApplication(seed))
  })

  // Generate trainees for each provider
  providers.forEach(provider => {

    // Approximate size of provider
    // TODO: store provider size somewhere so it can be used here and
    // by the course generator
    let providerSize = getRandomInt(50) 

    yearsToGenerate.forEach((year) => {
      // Years can be ±10% in size
      let traineeCount = getRandomArbitrary((providerSize * 0.9), (providerSize * 1.1))
      if (provider == "Coventry University") traineeCount = 100
      applications = applications.concat(generateFakeApplicationsForProvider(provider, year, traineeCount))
    })

  })

  applications = applications.sort(sortBySubmittedDate)

  return applications

}

/**
 * Generate a number of fake applications
 *
 * @param {String} count Number of applications to generate
 *
 */
const generateFakeApplicationsForProvider = (provider, year, count) => {

  let applications = []
  let targetCounts

  // Current year should be mostly trn recieved
  if (year == currentYear){
    targetCounts = {
      draft: 0.05,
      applyEnrolled: 0.05,
      pendingTrn: 0.05,
      trnReceived: 0.71,
      qualificationRecommended: 0.05,
      qualificationAwarded: 0.05,
      deferred: 0.02,
      withdrawn: 0.02,
    }
  }
  // Previous years will be mostly awarded with some withdrawn and a handful of deferred
  else {
    targetCounts = {
      draft: 0,
      pendingTrn: 0,
      trnReceived: 0,
      qualificationRecommended: 0,
      qualificationAwarded: 0.95,
      deferred: (year == 2019) ? 0.05 : 0, // allow for a couple deferred students from previous year
      withdrawn: 0.05,
    }
  }

  const stubApplication = {} 

  // Todo: make these drafts more random
  stubApplication.draft = {
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
    updatedDate: faker.date.between(
      moment(),
      moment().subtract(16, 'days'))
  }

  let applyStubUpdatedDate = faker.date.between(
    moment(),
    moment().subtract(16, 'days')
  )

  stubApplication.applyEnrolled = {
    source: "Apply",
    status: "Apply enrolled",
    updatedDate: applyStubUpdatedDate,
    applyData: {
      recruitedDate: applyStubUpdatedDate,
      applicationDate: faker.date.between(
        moment().subtract(30, 'days'),
        moment().subtract(60, 'days')
      )
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
    degree: {
      status: 'Completed'
    },
    academicYear: currentYear,
    programmeDetails: {
      isPublishCourse: true,
      status: 'Completed'
    },
    placement: null,
    trainingDetails: null
  }

  stubApplication.pendingTrn = {
    status: 'Pending TRN'
  }

  stubApplication.trnReceived = {
    status: 'TRN received'
  }

  stubApplication.qualificationRecommended = {
    status: 'QTS recommended',
    route: (year == currentYear) ? "Assessment only" : undefined // AO is the only route likely to be recommended
  }

  stubApplication.qualificationAwarded = {
    status: 'QTS awarded',
    route: (year == currentYear) ? "Assessment only" : undefined // AO is the only route likely to be recommended
  }

  stubApplication.deferred = {
    status: 'Deferred'
  }

  stubApplication.withdrawn = {
    status: 'Withdrawn'
  }

  for (var i = 0; i < count; i++) {
    // Pick an application in a certain state
    let statusPick = weighted.select(targetCounts)
    // Set common provider and year for all stubs
    let selectedStub = {
      ...{
        provider,
        academicYear: year
      }, 
      ...stubApplication[statusPick]
    }

    const application = generateFakeApplication(selectedStub)
    applications.push(application)
  }

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
  // console.log(applications)
  console.log(`Generated ${applications.length} records`)

  // Logging
  let applicationCounts = {}
  statuses.forEach(status => {
    applicationCounts[status] = applications.filter(application => application.status == status).length
  })
  console.log({applicationCounts})

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
