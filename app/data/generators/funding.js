const faker   = require('faker')
const weighted = require('weighted')

const trainingRouteData = require('./../training-route-data')
const trainingRoutes = trainingRouteData.trainingRoutes
const utils = require('./../../lib/utils.js')

module.exports = (params) => {

  let routeData = trainingRoutes[params.route]

  // Only some routes have bursaries possible
  let availableBursary = utils.getBursary(params)

  let initiatives = routeData?.initiatives || []
  let randomInitiative = faker.helpers.randomize(initiatives)
  let initiative

  let noInitiativeString = 'Not on a training initiative'

  if (initiatives.length == 0){
   initiative = noInitiativeString
  }
  else {
    // Majority of trainees not on initiatives
    initiative = weighted.select([noInitiativeString, randomInitiative], [0.95, 0.05])
  }

  // Only generate bursary data for routes that have bursaries
  let bursary = false
  if (availableBursary){
    bursary = {}

    bursary.selfFunded = weighted.select(['true', 'false'], [0.1, 0.9])

    // Special handling for Early years (postgrad)
    if (bursary.selfFunded == 'false' && availableBursary.tiersApply){
      let selectedTier = faker.helpers.randomize(availableBursary.tiers)
      bursary.selfFunded = selectedTier.name
    }

    // let degreeItems = params?.degree?.items

    // Commented out for now as we'll dynamically look it up
    // if (bursary.selfFunded == 'false'){

    //   // Value depends on subject chosen
    //   bursary.bursaryValue = availableBursary.value

    //   // If a person has a bursary and multiple degrees, they need to pick which
    //   // degree the bursary is for
    //   if (degreeItems && degreeItems.length > 1){
    //     bursary.degreeToBeUsedForBursaries = faker.helpers.randomize(degreeItems).id
    //   }

    // }

  }

  return  {
    initiative,
    ...(bursary ? {bursary} : {}) // conditional
  }
}
