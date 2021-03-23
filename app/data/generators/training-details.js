// Generates fake training details

const moment = require('moment')
const weighted = require('weighted')
const faker   = require('faker')
const schools = require('../schools.json')
const trainingRouteData = require('../training-route-data')

faker.locale  = 'en_GB'

// Not all trainees have start dates - but to get these statuses you must have
const statusesWhereTraineesMustHaveStarted = [
  'EYTS recommended',
  'EYTS awarded',
  'QTS recommended',
  'QTS awarded'
]


module.exports = (params) => {

  let routeData = trainingRouteData.trainingRoutes[params.route]

  // Todo: make traineeId closer to what Providers user (20/21-1234, etc)
  const traineeId = faker.random.alphaNumeric(8).toUpperCase()

  // Much better to use submitted date
  let commencementDate = params?.submittedDate || faker.date.between(
    moment(),
    moment().subtract(200, 'days'))

  let traineeStarted

  // Some statuses implicitly *must* have a commencement date
  if (statusesWhereTraineesMustHaveStarted.includes(params?.status)){
    traineeStarted = true
  }
  else {
    traineeStarted = params?.traineeStarted || weighted.select({
      "true": 0.8, // Most students should have commencement dates
      "false": 0.2
    })
  }

  commencementDate = (traineeStarted == "true") ? commencementDate : undefined

  let leadSchool = (routeData.fields && routeData.fields.includes("leadSchool")) ? faker.helpers.randomize(schools) : null

  let employingSchool = null

  if (routeData.fields && routeData.fields.includes("employingSchool")) {
    let tempEmploying = faker.helpers.randomize(schools.filter(school => {
      if (!school.postcode || !leadSchool.postcode) return false
      else return school.postcode.startsWith(leadSchool.postcode.charAt(0))
    }))
    employingSchool = (!tempEmploying) ? faker.helpers.randomize(schools) : tempEmploying
  }



  return {
    traineeId,
    traineeStarted,
    commencementDate,
    ...(leadSchool ? {leadSchool} : {}),
    ...(employingSchool ? {employingSchool} : {}),
  }
}
