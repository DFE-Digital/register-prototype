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
let withdrawalReasons = require('./withdrawal-reasons')

// Different programmes
let programmes              = require('./programmes')
let settings = {}
settings.enabledProgrammes = Object.values(programmes).filter(programme => programme.enabled == true).map(programme => programme.name)
settings.includeTimeline = 'true'

let allProgrammes = Object.values(programmes).map(programme => programme.name)

console.log(settings)

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
  allProgrammes,
  assessmentOnlyAgeRanges,
  awards,
  countries,
  degreeOrganisations,
  degreeTypes,
  ethnicities,
  ittSubjects,
  nationalities,
  programmes,
  records,
  settings,
  subjects,
  ukComparableDegrees,
  withdrawalReasons
  // Insert values here

}
