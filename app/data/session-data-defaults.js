let ethnicities = require('./ethnicities')
let nationalities = require('./nationalities')
let records = require('./records.json')
// let subjects = require('./subjects')
let assessmentOnlyAgeRanges = require('./assessmentOnlyAgeRanges')
let degreeData = require('./degree')()
let degreeTypes = degreeData.types.undergraduate.map(type => type.text)
let subjects = degreeData.subjects
let degreeOrganisations = degreeData.orgs
let countries = require('./countries')
let awards = require('./awards')

let ittSubjects = require('./itt-subjects').map( subject => subject.attributes.subject_name )


module.exports = {
  assessmentOnlyAgeRanges,
  ethnicities,
  nationalities,
  records,
  subjects,
  degreeOrganisations,
  degreeTypes,
  countries,
  awards,
  ittSubjects
  // Insert values here

}
