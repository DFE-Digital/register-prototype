var CSV = require('csv-string')
let subjectSpecialismsCsv = 
`subjectSpecialism,isEbac,allocationSubject
Design,No,Design and technology
Product design,No,Design and technology
Graphic design,No,Art and design
Dance,No,Physical education
Drama,No,Drama
Performing arts,No,Drama
Business and management,No,Business studies
Business studies,No,Business studies
Public services,No,Other subjects
Retail management,No,Business studies
Sports management,No,Physical education
Travel and tourism,No,Other subjects
Construction and the built environment,No,Design and technology
General or integrated engineering,No,Design and technology
Manufacturing engineering,No,Design and technology
Production and manufacturing engineering,No,Design and technology
Textiles technology,No,Design and technology
Materials science,No,Design and technology
Classical studies,Yes,Classics
History,Yes,History
English studies,Yes,English
French language,Yes,Modern languages
German language,Yes,Modern languages
Italian language,Yes,Modern languages
Modern languages,Yes,Modern languages
Russian languages,Yes,Modern languages
Spanish language,Yes,Modern languages
Welsh language,Yes,Modern languages
Philosophy,No,Religious education
Religious studies,No,Religious education
Applied biology,Yes,Biology
Biology,Yes,Biology
Applied computing,No,Computing
Computer science,Yes,Computing
Information technology,No,Computing
Environmental sciences,No,Biology
General sciences,Yes,Biology
Mathematics,Yes,Mathematics
Statistics,Yes,Mathematics
Geography,Yes,Geography
Chemistry,Yes,Chemistry
Physics,Yes,Physics
Sport and exercise sciences,No,Physical education
Media and communication studies,No,Other subjects
Economics,Yes,Economics
Child development,Yes,Other subjects
Social sciences,No,Other subjects
Health studies,No,Other subjects
Health and social care,No,Other subjects
Law,No,Other subjects
Psychology,No,Other subjects
Early years teaching,No,Early years ITT
Primary teaching,No,Primary
UK government / Parliamentary studies,No,Other subjects
Music education and teaching,No,Music
Hospitality,No,Design and technology
Recreation and leisure studies,No,Business studies
Food and beverage studies,No,Design and technology
Applied chemistry,Yes,Chemistry
Applied physics,Yes,Physics
Specialist teaching,No,Primary with mathematics
Ancient Hebrew,Yes,Classics
Classical Greek studies,Yes,Classics
Portuguese language,Yes,Modern languages
Chinese languages,Yes,Modern languages
Arabic languages,Yes,Modern languages
Creative arts and design,No,Art and design
Hair and beauty sciences,No,Other subjects
Historical linguistics,No,Classics
Latin language,Yes,Classics`

let subjectSpecialismsCsvArray = CSV.parse(subjectSpecialismsCsv)
subjectSpecialismsCsvArray.shift() // remove header row

// Base data structure
let subjectsObjectArray = subjectSpecialismsCsvArray.map(specialism => {
  return {
    name: specialism[0],
    isEbac: (specialism[1] == "Yes") ? true : false,
    allocationSubject: specialism[2]
  }
})

// Flat array of specialisms
let subjectSpecialismsArray = [... new Set(subjectsObjectArray.map(specialism => specialism.name))].sort()

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
let allocationSubjectsArray = [... new Set(subjectsObjectArray.map(specialism => specialism.allocationSubject))].sort()

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

let peSubjects = allocationSubjects['Physical education'].subjectSpecialisms
let modernLanguagesSubjects = allocationSubjects['Modern languages'].subjectSpecialisms
let ebacSubjects = subjectsObjectArray.filter(specialism => specialism.isEbac).map(specialism => specialism.name).sort()

// Subject subsets used for seed generators
// Non exaustive list
// Just ones commonly seen - good enough for seeds

commonPrimarySubjects = [
  "Primary teaching",
  "English studies",
  "Mathematics",
  "Modern languages",
  // "Physical education",
  "Biology",
  "Specialist teaching", // primary with maths
  // "Early years teaching", // only for EYTS?
  "Sport and exercise sciences",
  "Spanish language",
  "German language",
  "French language",
]

commonSecondarySubjects = [
  "Creative arts and design",
  "Biology",
  "Business studies",
  "Chemistry",
  "Media and communication studies",
  "Computer science",
  "Dance",
  "Product design",
  "Graphic design",
  "Drama",
  "Economics",
  "English studies",
  "Geography",
  "Health and social care",
  "History",
  "Mathematics",
  "Modern languages",
  "Music education and teaching",
  "Philosophy",
  // "Physical education", // not a specialism
  "Physics",
  "Psychology",
  "Religious studies",
  "Social sciences"
]

coreSubjects = [
  "English studies",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology"
]

module.exports = {
  subjectsObjectArray,
  subjectSpecialisms,
  subjectSpecialismsArray,
  allocationSubjects,
  allocationSubjectsArray,
  coreSubjects,
  modernLanguagesSubjects,
  peSubjects,
  commonPrimarySubjects,
  commonSecondarySubjects
}
