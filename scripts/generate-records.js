// To generate new records:

// node scripts/generate-records.js

const fs = require('fs')
const path = require('path')
const faker = require('faker')
faker.locale = 'en_GB'
const moment = require('moment')
const _ = require('lodash')

// Settings
let simpleGcseGrades = true //output pass/fail rather than full detail

const sortBySubmittedDate = (x, y) => {
  return new Date(y.submittedDate) - new Date(x.submittedDate);
}

const generateStatus = require('../app/data/generators/status')
const generatePersonalDetails = require('../app/data/generators/personal-details')
const generateDiversity = require('../app/data/generators/diversity')
const generateContactDetails = require('../app/data/generators/contact-details')
const generateAssessmentOnlyDetails = require('../app/data/generators/assessment-only-details')
const generateDegree = require('../app/data/generators/degree')
const generateGce = require('../app/data/generators/gce')
const generateGcse = require('../app/data/generators/gcse')

// Populate application data object with fake data
const generateFakeApplication = (params = {}) => {

  const status = params.status || generateStatus(faker)

  // Dates
  let updatedDate, submittedDate
  // Make sure updated is after submitted
  if (params.submittedDate){
    updatedDate = params.updatedDate || faker.date.between(
      moment(),
      moment(params.submittedDate))
  }
  else {
    // Updated at some point in last 500 days
    updatedDate = params.updatedDate || faker.date.between(
      moment(),
      moment().subtract(500, 'days'))
  }
  // Submitted some time before it was updated
  if (status != 'Draft'){
    submittedDate = params.submittedDate || faker.date.between(
    moment(updatedDate),
    moment().subtract(500, 'days'))
  }

  // Personal details
  const personalDetails = (params.personalDetails === null) ? null : { ...generatePersonalDetails(faker), ...params.personalDetails }

  // Diversity
  const diversity = (params.diversity === null) ? undefined : { ...generateDiversity(faker), ...params.diversity }

  // Contact details
  const isInternationalTrainee = !(personalDetails.nationality.includes('British') || personalDetails.nationality.includes('Irish'))
  let person = Object.assign({}, personalDetails)
  person.isInternationalTrainee = isInternationalTrainee
  const contactDetails = (params.contactDetails === null) ? undefined : { ...generateContactDetails(faker, person), ...params.contactDetails }

  // Assessment details
  const programmeDetails = (params.programmeDetails === null) ? undefined : { ...generateAssessmentOnlyDetails(faker, status), ...params.programmeDetails }

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

  // const provider = faker.helpers.randomize(organisations.filter(org => !org.isAccreditedBody))

  return {
    id: params.id || faker.random.uuid(),
    route: "Assessment Only",
    traineeId: params.traineeId || faker.random.alphaNumeric(8).toUpperCase(),
    status,
    trn,
    updatedDate,
    submittedDate,
    personalDetails,
    diversity,
    isInternationalTrainee,
    contactDetails,
    programmeDetails,
    gcse,
    degree

    // gcse: params.gcse || generateGcse(faker, personalDetails.isInternationalTrainee),
    // englishLanguageQualification: params.englishLanguageQualification || generateEnglishLanguageQualification(faker),
    // otherQualifications: params.otherQualifications || generateOtherQualifications(faker),
    // schoolExperience: generateSchoolExperience(faker)
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

  // Manually create specific applications
  applications.push(generateFakeApplication({
    status: 'Pending TRN',
    submittedDate: new Date(),
    personalDetails: {
      givenName: "Becky",
      familyName: "Brothers",
      nationality: ["British"],
      sex: 'Female'
    },
    diversity: {
      "diversityDisclosed": "true",
      "ethnicGroup": "Black, African, Black British or Caribbean",
      "ethnicGroupSpecific": "Caribbean",
      "disabledAnswer": "Not provided"
    }
  }))

  // Manually create specific applications
  applications.push(generateFakeApplication({
    status: "TRN received",
    traineeId: "FLD38X59",
    submittedDate: "2020-05-28T12:37:21.384Z",
    updatedDate: "2020-08-04T04:26:19.269Z",
    trn: 8405624,
    personalDetails: {
      givenName: "Bea",
      familyName: "Waite",
      sex: "Female"
    },
  }))

  // Manually create specific applications
  applications.push(generateFakeApplication({
    status: "TRN received",
    traineeId: "TLQGB1N1",
    submittedDate: "2020-06-28T12:37:21.384Z",
    updatedDate: "2020-07-04T04:26:19.269Z",
    trn: 8594837,
    personalDetails: {
      givenName: "Janine",
      familyName: "Newman",
      sex: "Female"
    },
  }))

  // Manually create specific applications
  applications.push(generateFakeApplication({
    status: "TRN received",
    traineeId: "K9BKXNTX",
    submittedDate: "2020-05-28T12:37:21.384Z",
    updatedDate: "2020-07-15T04:26:19.269Z",
    trn: 8694898,
    personalDetails: {
      givenName: "Martin",
      familyName: "Cable",
      sex: "Male"
    },
  }))

  // Incomplete draft applications
  for (var i = 0; i < 1; i++) {
    const application = generateFakeApplication({
      status: 'Draft',
      personalDetails: {
        status: 'Completed'
      },
      diversity: null,
      contactDetails: null,

      updatedDate: faker.date.between(
        moment(),
        moment().subtract(16, 'days'))
    })
    applications.push(application)
  }

  // // Semi complete draft applications
  for (var i = 0; i < 1; i++) {
    const application = generateFakeApplication({
      status: 'Draft',
      personalDetails: {
        status: 'Completed'
      },
      contactDetails: {
        status: 'Completed'
      },
      diversity: {
        status: 'Completed'
      },
      updatedDate: faker.date.between(
        moment(),
        moment().subtract(16, 'days'))
    })
    applications.push(application)
  }

    // Complete draft applications
  for (var i = 0; i < 1; i++) {
    const application = generateFakeApplication({
      status: 'Draft',
      personalDetails: {
        status: 'Completed'
      },
      contactDetails: {
        status: 'Completed'
      },
      diversity: {
        status: 'Completed'
      },
      gcse: {
        status: 'Completed'
      },
      degree: {
        status: 'Completed'
      },
      programmeDetails: {
        status: 'Completed'
      },
      updatedDate: faker.date.between(
        moment(),
        moment().subtract(1, 'days'))
    })
    applications.push(application)
  }

  // // Submitted applications
  for (var i = 0; i < 5; i++) {
    let updatedDate = faker.date.between(
        moment(),
        moment().subtract(6, 'days'))
    const application = generateFakeApplication({
      status: 'Pending TRN',
      updatedDate,
      submittedDate: updatedDate
    })
    applications.push(application)
  }

  for (var i = 0; i < 5; i++) {
    const application = generateFakeApplication({
      status: 'TRN received',
      updatedDate: faker.date.between(
        moment().subtract(2, 'days'),
        moment().subtract(6, 'days'))
    })
    applications.push(application)
  }

  for (var i = 0; i < 15; i++) {
    const application = generateFakeApplication({
      status: 'TRN received',
      updatedDate: faker.date.between(
        moment().subtract(2, 'days'),
        moment().subtract(600, 'days'))
    })
    applications.push(application)
  }

  for (var i = 0; i < 10; i++) {
    const application = generateFakeApplication({
      status: 'Pending QTS',
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
      updatedDate: faker.date.between(
        moment().subtract(50, 'days'),
        moment().subtract(300, 'days'))
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
