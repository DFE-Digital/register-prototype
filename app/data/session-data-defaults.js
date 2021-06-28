let countries               = require('./countries')
let ethnicities             = require('./ethnicities')
let nationalities           = require('./nationalities')
let statuses                = require('./status')
let strings                 = require('./strings')

// Degree stuff
let awards                  = require('./awards') // Types of degree
let degreeData              = require('./degree')()
let degreeTypes             = degreeData.types.all
let degreeTypesSimple             = degreeData.types.all.map(type => type.text).sort()
let subjects                = degreeData.subjects
let ukComparableDegrees     = degreeData.ukComparableDegrees
let degreeOrganisations     = degreeData.orgs

// Undergraduate qualification
let ugEntryQualifications   = require('./undergraduate-qualifications')

// Assessment only
let assessmentOnlyAgeRanges = require('./assessmentOnlyAgeRanges')
let ittSubjectData = require('./itt-subjects')
let ittSubjects = ittSubjectData.subjectSpecialismsArray
let allSubjects = ittSubjectData.allSubjects

let withdrawalReasons       = require('./withdrawal-reasons')
let notPassedReasons       = require('./not-passed-reasons')

// Different training routes
let trainingRouteData          = require('./training-route-data')
let trainingRoutes = trainingRouteData.trainingRoutes
let publishRoutes = trainingRouteData.publishRoutes
let nonPublishRoutes = trainingRouteData.nonPublishRoutes
let allTrainingRoutes       = Object.values(trainingRoutes).map(route => route.name)

let courses                 = require('./courses.json')
// let schools                 = require('./gis-schools.js') // too big to load in to session

// Super hacky method of picking 5 schools randomly from the list to
// pretend to be the provider's recently used schools
// let schoolsTop5             = schools.slice(1200).filter((school, index ) => (index % 330 == 0)).slice(0, 5)

let providerData            = require('./providers.js')
let providers               = providerData.selectedProviders
let allProviders            = providerData.allProviders

let currentYear             = 2020

// =============================================================================
// Settings - things that can be changed from /admin
// =============================================================================

let settings = {}

// Currently enabled routes
settings.enabledTrainingRoutes = Object.values(trainingRoutes).filter(route => route.defaultEnabled == true).map(route => route.name).sort()

// One of `blended-model` or `hat-model`
settings.providerModel = "blended-model"

// The providers the signed-in user belongs to
settings.userProviders = [
  "Coventry University",
  // "University of Buckingham"
]

// The ‘active’ provider for the current user if using hat model
// Must be one of the ones in settings.userProviders
settings.userActiveProvider = "Coventry University"

// Enable timeline on records
settings.includeTimeline = 'true'

// Enable apply integration
settings.enableApplyIntegration = 'true'

// Enable apply integration
settings.showRequiresAttentionSection = 'true'

// Enable apply integration
settings.groupApplySections = 'true'

// Enable apply integration
settings.highlightInvalidAnswers = 'true'

// Enable timeline on records
settings.includeGuidance = false

// Enable timeline on records
settings.includeDeclaration = false

// Enable timeline on records
settings.showBulkLinks = false

// Where drafts page should live
settings.draftsInPrimaryNav = 'true'

// Start date is required when registering trainees
settings.requireTraineeStartDate = 'true'

// Default number of Publish courses that the provider offers
settings.courseLimit = 12

// the minimum number of placements before EYTS/QTS can be awarded
settings.minPlacementsRequired = 2

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
  currentYear,
  degreeOrganisations,
  degreeTypes,
  degreeTypesSimple,
  ethnicities,
  ittSubjects,
  allSubjects,
  nationalities,
  notPassedReasons,
  providers,
  allProviders,
  records,
  // schools,
  // schoolsTop5,
  settings,
  statuses,
  strings,
  subjects,
  trainingRoutes,
  publishRoutes,
  nonPublishRoutes,
  ukComparableDegrees,
  withdrawalReasons,
  ugEntryQualifications
}
