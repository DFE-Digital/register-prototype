var CSV = require('csv-string')
const _ = require('lodash')

// -------------------------------------------------------------------
// Utilities
// -------------------------------------------------------------------

// Sort two things alphabetically, not case-sensitive
const sortAlphabetical = (x, y) => {
  if(x.toLowerCase() !== y.toLowerCase()) {
    x = x.toLowerCase();
    y = y.toLowerCase();
  }
  return x > y ? 1 : (x < y ? -1 : 0);
}

// Source data comes in lowercased, but for legacy reasons we want it
// uppercased
const upcaseFirstChar = input => {
  const upcaseString = string => {

    if (_.isString(string)){
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    return ''
  }

  if (!input) return '' // avoid printing false to client

  if (_.isString(input)){
    return upcaseString(input)
  }
  else if (_.isArray(input)){
    return input.map(item => upcaseString(item))
  }
}

// -------------------------------------------------------------------
// CSV of subject data - columns are:
// Subject specialisms, ebac true/false, Allocation subject
// 
// These are the lowest level subjects set on a trainee, to describe
// what they're studying
// -------------------------------------------------------------------

// Csv from google doc
let subjectSpecialismsCsv = 
`Subect specialism (Register reworded),EBacc Subject,Allocation Subject - (Register reworded)
product design,No,Art and design
creative arts and design,No,Art and design
applied biology,Yes,Biology
biology,Yes,Biology
environmental sciences,No,Biology
business and management,No,Business studies
business studies,No,Business studies
retail management,No,Business studies
chemistry,Yes,Chemistry
applied chemistry,Yes,Chemistry
UK government / Parliamentary studies,No,Other subjects
Ancient Hebrew,Yes,Classics
classical studies,Yes,Classics
classical Greek studies,Yes,Classics
historical linguistics,No,Classics
Latin language,Yes,Classics
media and communication studies,No,Other subjects
applied computing,No,Computing
computer science,Yes,Computing
information technology,No,Computing
dance,No,Physical education
design,No,Design and technology
product design,No,Design and technology
construction and the built environment,No,Design and technology
general or integrated engineering,No,Design and technology
manufacturing engineering,No,Design and technology
production and manufacturing engineering,No,Design and technology
textiles technology,No,Design and technology
materials science,No,Design and technology
food and beverage studies,No,Design and technology
drama,No,Drama
performing arts,No,Drama
economics,Yes,Economics
English studies,Yes,English
French language,Yes,Modern languages
geography,Yes,Geography
German language,Yes,Modern languages
health and social care,No,Other subjects
history,Yes,History
Italian language,Yes,Modern languages
modern languages,Yes,Modern languages
Chinese languages,Yes,Modern languages
mathematics,Yes,Mathematics
statistics,Yes,Mathematics
Arabic languages,Yes,Modern languages
Welsh language,Yes,Modern languages
Portuguese language,Yes,Modern languages
music education and teaching,No,Music
philosophy,No,Religious education
sports management,No,Physical education
sport and exercise sciences,No,Physical education
physics,Yes,Physics
applied physics,Yes,Physics
primary teaching,No,Primary
psychology,No,Other subjects
religious studies,No,Religious education
Russian languages,Yes,Modern languages
general sciences,Yes,Biology
social sciences,No,Other subjects
Spanish language,Yes,Modern languages
public services,No,Other subjects
travel and tourism,No,Other subjects
child development,Yes,Other subjects
health studies,No,Other subjects
law,No,Other subjects
early years teaching,No,Early years ITT
hospitality,No,Design and technology
recreation and leisure studies,No,Business studies
specialist teaching (primary with mathematics),No,Primary with mathematics
hair and beauty sciences,No,Other subjects`

let subjectSpecialismsCsvArray = CSV.parse(subjectSpecialismsCsv)
subjectSpecialismsCsvArray.shift() // remove header row

// Base data structure
// Todo: would an object be easier
let subjectsObjectArray = subjectSpecialismsCsvArray.map(specialism => {
  return {
    name: upcaseFirstChar(specialism[0]),
    isEbac: (specialism[1] == "Yes") ? true : false,
    allocationSubject: specialism[2]
  }
})

// Flat array of specialisms
let subjectSpecialismsArray = [... new Set(subjectsObjectArray.map(specialism => specialism.name))].sort(sortAlphabetical)

// Object keyed by specialism
// {
//   'Ancient Hebrew': {
//     name: 'Ancient Hebrew',
//     isEbac: true,
//     allocationSubject: 'Classics'
//   },
//   'Applied biology': {
//     name: 'Applied biology',
//     isEbac: true,
//     allocationSubject: 'Biology'
//   },
//   'Applied chemistry': {
//     name: 'Applied chemistry',
//     isEbac: true,
//     allocationSubject: 'Chemistry'
//   }
// }
let subjectSpecialisms = {}
subjectSpecialismsArray.forEach(subject => {
  subjectSpecialisms[subject] = subjectsObjectArray.find(item => item.name == subject)
})

// Flat array of allocation subjects
let allocationSubjectsArray = [... new Set(subjectsObjectArray.map(specialism => specialism.allocationSubject))].sort(sortAlphabetical)

// Object keyed by allocation subject
// {
//   'Art and design': {
//     name: 'Art and design',
//     subjectSpecialisms: [ 'Graphic design', 'Creative arts and design' ]
//   },
//   Biology: {
//     name: 'Biology',
//     subjectSpecialisms: [
//       'Applied biology',
//       'Biology',
//       'Environmental sciences',
//       'General sciences'
//     ]
//   },
//   'Business studies': {
//     name: 'Business studies',
//     subjectSpecialisms: [
//       'Business and management',
//       'Business studies',
//       'Retail management',
//       'Recreation and leisure studies'
//     ]
//   },...
let allocationSubjects = {}
allocationSubjectsArray.forEach(subject => {
  allocationSubjects[subject] = {
    name: subject,
    subjectSpecialisms: subjectsObjectArray.filter(specialism => specialism.allocationSubject == subject).map(specialism => specialism.name)
  }
})

// Specialisms and allocations together
let allSubjects = [...new Set(subjectSpecialismsArray.concat(allocationSubjectsArray).sort())]

// Groups of subjects
let peSubjects = allocationSubjects['Physical education'].subjectSpecialisms
let modernLanguagesSubjects = allocationSubjects['Modern languages'].subjectSpecialisms
let designAndTechnologySubjects = allocationSubjects['Design and technology'].subjectSpecialisms
let ebacSubjects = subjectsObjectArray.filter(specialism => specialism.isEbac).map(specialism => specialism.name).sort(sortAlphabetical)

// Subject subsets used for seed generators
// Non exaustive list
// Just ones commonly seen - good enough for seeds
commonPrimarySubjects = upcaseFirstChar([
  "primary teaching",
  "English studies",
  "mathematics",
  "Modern languages",
  // "Physical education",
  "biology",
  "specialist teaching", // primary with maths
  // "Early years teaching", // only for EYTS?
  "sport and exercise sciences",
  "Spanish language",
  "German language",
  "French language",
])

// Todo: are these needed any more? should use publish list
commonSecondarySubjects = upcaseFirstChar([
  "creative arts and design",
  "biology",
  "business studies",
  "chemistry",
  "media and communication studies",
  "computer science",
  "dance",
  "product design",
  "graphic design",
  "drama",
  "economics",
  "English studies",
  "geography",
  "health and social care",
  "history",
  "mathematics",
  "modern languages",
  "music education and teaching",
  "philosophy",
  // "Physical education", // not a specialism
  "physics",
  "psychology",
  "religious studies",
  "social sciences"
])

coreSubjects = upcaseFirstChar([
  "English studies",
  "mathematics",
  "physics",
  "chemistry",
  "biology"
])

// -------------------------------------------------------------------
// CSV of Publish subjects data - columns are:
// Publish subject, Register allocation subject, Specialism (if mappable)
// 
// Publish’s list is a bit different than the dttp list. Most things can map to a specialism, 
// but not all. All should map to an allocation subject at least.
// -------------------------------------------------------------------
let publishSubjectsCsv = `Publish subject,Allocation Subject - (Register reworded),Subect specialism (Register reworded)
art and design,Art and design,
biology,Biology,
business studies,Business studies,
chemistry,Chemistry,
citizenship,Other subjects,UK government / Parliamentary studies
classics,Classics,
communication and media studies,Other subjects,media and communication studies
computing,Computing,
dance,Physical education,dance
design and technology,Design and technology,
drama,Drama,
economics,Economics,economics
English,English,English studies
French,Modern languages,French language
geography,Geography,geography
German,Modern languages,German language
health and social care,Other subjects,health and social care
history,History,history
Italian,Modern languages,Italian language
Japanese,Modern languages,modern languages
Mandarin,Modern languages,Chinese languages
mathematics,Mathematics,
modern languages (other),Modern languages,modern languages
music,Music,music education and teaching
philosophy,Religious education,philosophy
physical education,Physical education,
physics,Physics,
primary,Primary,primary teaching
primary with English,Primary,primary teaching,English studies
primary with physical education,Primary,primary teaching,
primary with science,Primary,primary teaching,general sciences
primary with geography and history,Primary,primary teaching,geography,history
primary with mathematics,Primary,specialist teaching (primary with mathematics),
primary with modern languages,Primary,primary teaching,modern languages
psychology,Other subjects,psychology
religious education,Religious education,religious studies
Russian,Modern languages,Russian languages
science,Biology,general sciences
social sciences,Other subjects,social sciences
Spanish,Modern languages,Spanish language
modern languages,Modern languages`

let publishSubjectsCsvArray = CSV.parse(publishSubjectsCsv)
publishSubjectsCsvArray.shift() // remove header row

// Base data structure
let publishSubjects = {}

// Convert csv data in to useful form
publishSubjectsCsvArray.forEach(subject => {

  let name = upcaseFirstChar(subject[0])
  let allocationSubject = subject[1]
  let specialism = upcaseFirstChar(subject[2]) || false
  let subjectSpecialisms = allocationSubjects[allocationSubject].subjectSpecialisms

  publishSubjects[name] = {
    name: name,
    allocationSubject,
    ...( specialism ? { specialism } : {} ), // conditionally return specialism
    // Specialisms only set if there isn’t a single specialism
    ...( !specialism ? { subjectSpecialisms } : {} ), // conditionally return specialism
  }
})

// console.log({publishSubjects})

corePublishSubjects = upcaseFirstChar([
  "English",
  "mathematics",
  "physics",
  "chemistry",
  "biology",
  "design and technology"
])


module.exports = {
  subjectsObjectArray,
  subjectSpecialisms,
  subjectSpecialismsArray,
  allocationSubjects,
  allocationSubjectsArray,
  allSubjects, // Specialisms and allocation subjects
  coreSubjects,
  modernLanguagesSubjects,
  designAndTechnologySubjects,
  peSubjects,
  commonPrimarySubjects,
  commonSecondarySubjects,
  publishSubjects,
  corePublishSubjects,
}
