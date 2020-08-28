const fs = require('fs')
const path = require('path')
const faker = require('faker')
faker.locale = 'en_GB'
const moment = require('moment')

const sortBySubmittedDate = (x, y) => {
  return new Date(y.submittedDate) - new Date(x.submittedDate);
}

// Fake data generators: general
const generateStatus = require('../app/data/generators/status')
// const generateCourse = require('../app/data/generators/course')
// const generateTrainingLocation = require('../app/data/generators/training-location')

// Fake data generators: application
const generatePersonalDetails = require('../app/data/generators/personal-details')
const generateDiversity = require('../app/data/generators/diversity')

const generateContactDetails = require('../app/data/generators/contact-details')

const generateAssessmentDetails = require('../app/data/generators/assessment-details')
const generateDegree = require('../app/data/generators/degree')

const generateGce = require('../app/data/generators/gce')

// const generateGcse = require('../app/data/generators/gcse')
// const generateEnglishLanguageQualification = require('../app/data/generators/english-language-qualification')
// const generateOtherQualifications = require('../app/data/generators/other-qualifications')
// const generateWorkHistory = require('../app/data/generators/work-history')
// const generateSchoolExperience = require('../app/data/generators/school-experience')

// Populate application data object with fake data
const generateFakeApplication = (params = {}) => {

  const status = params.status || generateStatus(faker)
  // const submittedDate = params.submittedDate || DateTime.fromISO('2019-08-15').minus({ days: 20 })
  const submittedDate = params.submittedDate || faker.date.between(
    moment(),
    moment().subtract(100, 'days'))
  const personalDetails = { ...generatePersonalDetails(faker), ...params.personalDetails }
  const diversity = { ...generateDiversity(faker), ...params.diversity }


  const isInternationalCandidate = !(diversity.nationality.includes('British') || diversity.nationality.includes('Irish'))

  let person = Object.assign({}, personalDetails)
  person.isInternationalCandidate = isInternationalCandidate

  const contactDetails = params.contactDetails || generateContactDetails(faker, person)

  const assessmentDetails = { ...generateAssessmentDetails(faker), ...params.assessmentDetails }

  let trn

  if (!status.includes('Incomplete') && !status.includes('Submitted')){
    trn = faker.random.number({
      'min': 1000000,
      'max': 9999999
    })
  }

  // const provider = faker.helpers.randomize(organisations.filter(org => !org.isAccreditedBody))

  return {
    // id: faker.random.alphaNumeric(7).toUpperCase(),
    id: faker.random.uuid(),
    candidateId: faker.random.alphaNumeric(8).toUpperCase(),
    // provider: provider.name,
    status,
    trn,
    submittedDate,
    personalDetails,
    diversity,
    isInternationalCandidate,
    contactDetails,
    assessmentDetails,
    qualifications: {
      degree: params.degree || generateDegree(faker, isInternationalCandidate),
      gce: params.gce || generateGce(faker, isInternationalCandidate),
    }

    // gcse: params.gcse || generateGcse(faker, personalDetails.isInternationalCandidate),
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

  // applications.push(generateFakeApplication({
  //   status: 'Deferred',
  //   offerCanNotBeReconfirmed: {
  //     reason: 'location'
  //   },
  //   cycle: 'Previous cycle (2019 to 2020)',
  //   personalDetails: {
  //     givenName: 'Becky',
  //     familyName: 'Brother',
  //     sex: 'Female'
  //   }
  // }))


  for (var i = 0; i < 20; i++) {
    const application = generateFakeApplication({
      status: 'Submitted'
    })
    applications.push(application)
  }

  for (var i = 0; i < 20; i++) {
    const application = generateFakeApplication()
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

generateApplicationsFile(path.join(__dirname, '../app/data/applications.json'))
