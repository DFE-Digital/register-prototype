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
const yearsToGenerate = [2020]
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
const getRandomEnabledRoute = () => faker.helpers.randomize(enabledTrainingRoutes)

// Generators
const generateTrainingDetails = require('../app/data/generators/training-details')
const generateDates = require('../app/data/generators/dates')
const generateTrn = require('../app/data/generators/trn')
const generateProgrammeDetails = require('../app/data/generators/programme-details')
const generatePersonalDetails = require('../app/data/generators/personal-details')
const generateContactDetails = require('../app/data/generators/contact-details')
const generateDiversity = require('../app/data/generators/diversity')
const generateDegree = require('../app/data/generators/degree')
const generateGce = require('../app/data/generators/gce')
const generateGcse = require('../app/data/generators/gcse')
const generateEvents = require('../app/data/generators/events')
const generatePlacement = require('../app/data/generators/placement')

// Populate application data object with fake data
const generateFakeApplication = (params = {}) => {

  let application = {}

  application.academicYear    = params.academicYear || currentYear
  application.diversity       = (params.diversity === null) ? undefined : { ...generateDiversity(), ...params.diversity }
  application.id              = params.id || faker.random.uuid()
  application.personalDetails = (params.personalDetails === null) ? undefined : { ...generatePersonalDetails(), ...params.personalDetails }
  application.provider        = params.provider || faker.helpers.randomize(providers)
  application.route           = (params.route === null) ? undefined : (params.route || getRandomEnabledRoute())
  application.status          = params.status || faker.helpers.randomize(statuses)
  if (application.status == "Deferred") {
    application.previousStatus = "TRN received" // set a state to go back to
  }

  // Needed in particular order

  // Dates
  application                  = { ...application, ...generateDates(params, application) }
  application.events           = generateEvents(application.status)
  // Training
  application.trn              = (params.trn === null) ? undefined : (params.trn || generateTrn(application.status) )
  application.programmeDetails = (params.programmeDetails === null) ? undefined : { ...generateProgrammeDetails(params, application), ...params.programmeDetails }
  application.trainingDetails  = (params.trainingDetails === null) ? undefined : { ...generateTrainingDetails(application), ...params.trainingDetails }
  // Contact details
  application.isInternationalTrainee = !(application.personalDetails.nationality.includes('British') || application.personalDetails.nationality.includes('Irish'))
  application.contactDetails   = (params.contactDetails === null) ? undefined : { ...generateContactDetails(application), ...params.contactDetails } 
  // Education
  application.gcse             = (params.gcse === null) ? undefined : { ...generateGcse(application.isInternationalTrainee, simpleGcseGrades), ...params.gcse }
  // A Levels - not used currently
  // application.gce = (params.gce === null) ? undefined : generateGce(faker, isInternationalTrainee)
  // Degrees
  application.degree           = (params.degree === null) ? undefined : { ...generateDegree(application.isInternationalTrainee), ...params.degree }
  // Placements
  application.placement        = (params.placement === null) ? undefined : { ...generatePlacement(application), ...params.placement }

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

  // let reducedProviders = providers.slice(0, 5) // shorter for testing
  let reducedProviders = providers

  // Generate trainees for each provider
  reducedProviders.forEach(provider => {

    // Approximate size of provider
    // TODO: store provider size somewhere so it can be used here and
    // by the course generator
    let providerSize = getRandomInt(50) 

    yearsToGenerate.forEach((year) => {
      // Years can be ±10% in size
      let traineeCount = getRandomArbitrary((providerSize * 0.9), (providerSize * 1.1))
      applications = applications.concat(generateFakeApplicationsForProvider(provider, year, traineeCount))
    })

  })

  // Logging
  let applicationCounts = {}
  statuses.forEach(status => {
    applicationCounts[status] = applications.filter(application => application.status == status).length
  })
  console.log({applicationCounts})

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
      pendingTrn: 0.05,
      trnReceived: 0.76,
      qtsRecommended: 0.05,
      qtsAwarded: 0.05,
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
      qtsRecommended: 0,
      qtsAwarded: 0.95,
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

  stubApplication.pendingTrn = {
    status: 'Pending TRN'
  }

  stubApplication.trnReceived = {
    status: 'TRN received'
  }

  stubApplication.qtsRecommended = {
    status: 'QTS recommended',
    route: (year == currentYear) ? "Assessment only" : undefined // AO is the only route likely to be recommended
  }

  stubApplication.qtsAwarded = {
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
