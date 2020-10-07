let ethnicities = require('./ethnicities')
let nationalities = require('./nationalities')


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

// let subjects = require('./subjects')
let assessmentOnlyAgeRanges = require('./assessmentOnlyAgeRanges')
let degreeData = require('./degree')()
let degreeTypes = degreeData.types.undergraduate.map(type => type.text)
let subjects = degreeData.subjects
let ukComparableDegrees = degreeData.ukComparableDegrees
let degreeOrganisations = degreeData.orgs
let countries = require('./countries')
let awards = require('./awards')

let ittSubjects = require('./itt-subjects').map( subject => subject.attributes.subject_name )

let withdrawReasons = require('./withdraw-reasons')

module.exports = {
  assessmentOnlyAgeRanges,
  ethnicities,
  nationalities,
  records,
  subjects,
  degreeOrganisations,
  degreeTypes,
  ukComparableDegrees,
  countries,
  awards,
  ittSubjects,
  withdrawReasons
  // Insert values here

}
