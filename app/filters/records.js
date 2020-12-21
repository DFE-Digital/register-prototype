// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _ = require('lodash')
const trainingRouteData = require('./../data/training-route-data')
const trainingRoutes = trainingRouteData.trainingRoutes
const recordUtils = require('./../lib/record')
const routeUtils = require('./../routes/route-utils')

// Leave this filters line
var filters = {}

filters.recordIsComplete = routeUtils.recordIsComplete

// Check if the course route requires this field
filters.requiresField = recordUtils.requiresField

// Check if the course route requires this section
filters.requiresSection = recordUtils.requiresSection

// Filter out records for routes that aren't enabled
// Needs to be old style function declaration for *this* to work
filters.filterDisabledTrainingRoutes = function(records){
  let enabledTrainingRoutes = _.get(this, "ctx.data.settings.enabledTrainingRoutes")
  if (!enabledTrainingRoutes) return [] // Something went wrong
  let filteredRecords = records.filter(record => {
    return enabledTrainingRoutes.includes(record.route)
  })
  return filteredRecords
}

filters.hasAllocatedPlaces = recordUtils.hasAllocatedPlaces

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters
