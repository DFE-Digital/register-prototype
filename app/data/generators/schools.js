// Generates fake training details

const moment = require('moment')
const weighted = require('weighted')
const faker   = require('faker')
const schools = require('../gis-schools.js')
const trainingRouteData = require('../training-route-data')

faker.locale  = 'en_GB'

const requiresLeadSchool = params => {
  let routeData = trainingRouteData.trainingRoutes[params.route]
  return routeData.fields && routeData.fields.includes("leadSchool")
}

const requiresEmployingSchool = params => {
  let routeData = trainingRouteData.trainingRoutes[params.route]
  return routeData.fields && routeData.fields.includes("employingSchool")
}

module.exports = (params) => {

  let leadSchool = requiresLeadSchool(params) ? faker.helpers.randomize(schools) : null

  let employingSchool = null

  if (requiresEmployingSchool(params)) {
    // Attempt to pick an employing school with a similar postcode
    let tempEmploying = faker.helpers.randomize(schools.filter(school => {
      if (!school.postcode || !leadSchool?.postcode) return false
      else return school.postcode.startsWith(leadSchool.postcode.charAt(0))
    }))
    // Fall back to random school if we didn’t find a tempEmploying
    employingSchool = (!tempEmploying) ? faker.helpers.randomize(schools) : tempEmploying
  }

  return {
    ...(leadSchool ? {leadSchool} : {}), // conditional
    ...(employingSchool ? {employingSchool} : {}), // conditional
  }
}
