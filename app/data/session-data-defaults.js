let countries               = require('./countries')
let ethnicities             = require('./ethnicities')
let nationalities           = require('./nationalities')
let statuses                = require('./status')

// Degree stuff
let awards                  = require('./awards') // Types of degree
let degreeData              = require('./degree')()
let degreeTypes             = degreeData.types.undergraduate.map(type => type.text).sort()
let subjects                = degreeData.subjects
let ukComparableDegrees     = degreeData.ukComparableDegrees
let degreeOrganisations     = degreeData.orgs

// Assessment only
let assessmentOnlyAgeRanges = require('./assessmentOnlyAgeRanges')
let ittSubjects = require('./itt-subjects').allSubjects

let withdrawalReasons       = require('./withdrawal-reasons')
let notPassedReasons       = require('./not-passed-reasons')

// Different training routes
let trainingRouteData          = require('./training-route-data')
let trainingRoutes = trainingRouteData.trainingRoutes
let allTrainingRoutes       = Object.values(trainingRoutes).map(route => route.name)

let courses                 = require('./courses.json')
// Things that can be changed from the /admin page
let settings = {}
// Simplify structure so it can be worked with from admin page
settings.enabledTrainingRoutes = Object.values(trainingRoutes).filter(route => route.defaultEnabled == true).map(route => route.name).sort()
settings.includeTimeline = 'true'
// Default number of Publish courses that the provider offers
settings.courseLimit = 8 

// Supliment records with getter for name
let records = require('./records.json')
records = records.map(record => {
  if (record.personalDetails){
    Object.defineProperty(record.personalDetails, 'fullName', {
      get() {
        let names = []
        names.push(this.givenName)
        names.push(this.middleNames)
        names.push(this.familyName)
        return names.filter(Boolean).join(' ')
      },
      enumerable: true
    })
    Object.defineProperty(record.personalDetails, 'shortName', {
      get() {
        let names = []
        names.push(this.givenName)
        names.push(this.familyName)
        return names.filter(Boolean).join(' ')
      },
      enumerable: true
    })
  }
  
  return record
})

module.exports = {
  allTrainingRoutes,
  assessmentOnlyAgeRanges,
  awards,
  countries,
  courses,
  degreeOrganisations,
  degreeTypes,
  ethnicities,
  ittSubjects,
  nationalities,
  notPassedReasons,
  records,
  settings,
  subjects,
  statuses,
  trainingRoutes,
  ukComparableDegrees,
  withdrawalReasons
}
