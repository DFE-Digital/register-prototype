let countries               = require('./countries')
let ethnicities             = require('./ethnicities')
let nationalities           = require('./nationalities')

// Degree stuff
let awards                  = require('./awards') // Types of degree
let degreeData              = require('./degree')()
let degreeTypes             = degreeData.types.undergraduate.map(type => type.text)
let subjects                = degreeData.subjects
let ukComparableDegrees     = degreeData.ukComparableDegrees
let degreeOrganisations     = degreeData.orgs

// Assessment only
let assessmentOnlyAgeRanges = require('./assessmentOnlyAgeRanges')
let ittSubjects             = require('./itt-subjects').map( subject => subject.attributes.subject_name )
let withdrawalReasons       = require('./withdrawal-reasons')

// Different training routes
let trainingRoutes          = require('./training-routes')
let allTrainingRoutes       = Object.values(trainingRoutes).map(route => route.name)

// Things that can be changed from the /admin page
let settings = {}
// Simplify structure so it can be worked with from admin page
settings.enabledTrainingRoutes = Object.values(trainingRoutes).filter(route => route.defaultEnabled == true).map(route => route.name).sort()
settings.includeTimeline = 'true'

// Supliment records with getter for name
let records = require('./records.json')
records = records.map(record => {
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
  return record
})

module.exports = {
  allTrainingRoutes,
  assessmentOnlyAgeRanges,
  awards,
  countries,
  degreeOrganisations,
  degreeTypes,
  ethnicities,
  ittSubjects,
  nationalities,
  records,
  settings,
  subjects,
  trainingRoutes,
  ukComparableDegrees,
  withdrawalReasons
}
