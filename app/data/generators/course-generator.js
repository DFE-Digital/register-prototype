// Generates fake course details
// Used to either simulate courses provided by publishers, or to populate
// data used in our seed records


const moment = require('moment')
const weighted = require('weighted')
const faker   = require('faker')
faker.locale  = 'en_GB'
const trainingRouteData = require('./../training-route-data')

const ittSubjects = require('./../itt-subjects')

let enabledRoutes = {}
trainingRouteData.enabledTrainingRoutes.forEach(route => {
  enabledRoutes[route] = trainingRouteData.trainingRoutes[route]
})

// One letter followed by three numbers
// Older course codes are a different format, but this is what
// will be used going forward
const generateCourseCode = () => {
  let chars = 'ABCDEFGHGKLMNPQRSTWXYZ' // without I or O
  let code = chars.charAt(Math.floor(Math.random() * chars.length));
  for (var i = 0; i < 3; i++){
    code += faker.random.number({
      'min': 0,
      'max': 9
    })
  }
  return code
}

// Common observed in Publish
// TODO: update this to export EYTS too
let qualificationOptions = {
  'one': {
    qualifications: ['QTS'],
    qualificationsSummary: 'QTS full time'
  },
  'two': {
    qualifications: ['QTS', 'PGCE'],
    qualificationsSummary: 'PGCE with QTS full time'
  },
  'three': {
    qualifications: ['QTS', 'PGDE'],
    qualificationsSummary: 'PGDE with QTS full time'
  },
  'four': {
    qualifications: ['QTS'],
    qualificationsSummary: 'QTS part time'
  },
  'five': {
    qualifications: ['QTS', 'PGDE'],
    qualificationsSummary: 'PGDE with QTS part time'
  }
}

// Pick an enabled route
const pickRoute = (isPublishCourse = false) => {
  if (isPublishCourse){
    let publishRoutes = Object.keys(enabledRoutes).filter(route => {
      return enabledRoutes[route].isPublishRoute
    })
    return faker.helpers.randomize(publishRoutes)
  }
  else {
    let nonPublishRoutes = Object.keys(enabledRoutes).filter(route => {
      return enabledRoutes[route].isNonPublishRoute
    })
    return faker.helpers.randomize(nonPublishRoutes)
  }
}

// Return some realistic subjects a primary teacher might train in
const getPrimarySubjects = subjectCount => {
  
  // Assumption that all primary courses have `Primary` as the first subject
  let subjects = ["Primary"]
  let primarySpecialisms = ittSubjects.primarySubjects.filter(subject => subject != "Primary")

  if (subjectCount == 2){
    let specialism = faker.helpers.randomize([
      faker.helpers.randomize(['Mathematics', "English studies"]), // Lots of primary teachers have these
      faker.helpers.randomize(ittSubjects.primarySubjects)
    ])
    subjects.push(specialism)
  }

  return subjects
}

// Return some realistic subjects a secondary teacher might train in
const getSecondarySubjects = (subjectCount) => {
  let subjects

  // Shuffle our data so we can get x values from them by slicing
  let randomisedLanguages = faker.helpers.shuffle(ittSubjects.modernLanguagesSubjects)
    .filter(subject => subject != 'English as a second or other language') // remove this item
  let randomisedSecondarySubjects = faker.helpers.shuffle(ittSubjects.secondarySubjects)
  let randomisedScienceSubjects = faker.helpers.shuffle(['Physics', 'Chemistry', 'Biology'])

  // Bias slightly towards specific subjects but have some random
  // ones too for good measure
  if (subjectCount == 1){
    subjects = faker.helpers.randomize([
      faker.helpers.randomize(ittSubjects.coreSubjects),
      faker.helpers.randomize(ittSubjects.secondarySubjects),
      "Physical education"  // included to test allocations
    ])
  }

  // Dual subjects typically have one of a few common sets of subjects
  if (subjectCount == 2){
    subjects = faker.helpers.randomize([
      randomisedLanguages.slice(0,2),                           // Two languages
      [randomisedSecondarySubjects[0], randomisedLanguages[0]], // One subject and one language
      randomisedScienceSubjects.slice(0,2),                     // Two sciences
      randomisedSecondarySubjects.slice(0,2),                   // Two subjects
      ["Physical education", randomisedScienceSubjects[0]]      // PE with EBacc
    ])

  }

  // Nearly always languages and sciences
  if (subjectCount == 3){
    subjects = faker.helpers.randomize([
      randomisedLanguages.slice(0,3), // Three languages
      randomisedScienceSubjects, // Science subjects
      ["Physical education"].concat(randomisedScienceSubjects.slice(0,2)) // PE with two EBacc subjects
    ])
  }

  return subjects
}

module.exports = (params) => {

  const isPublishCourse = (params.isPublishCourse) ? true : false

  const route = params.route || pickRoute(isPublishCourse)

  let level, qualifications, qualificationsSummary, studyMode

  if (route.includes('Early years')){
    level = 'Early years'
  }
  else level = faker.helpers.randomize(['Primary', 'Secondary'])

  let ageRanges = trainingRouteData.levels[level].ageRanges

  let ageRange = (Array.isArray(ageRanges)) ? faker.helpers.randomize(ageRanges) : null

  let subjects

  if (route.includes('Early years')){
    subjects = 'Early years'
  }
  else if (level == 'Primary'){
    subjects = getPrimarySubjects(weighted.select([1,2],[0.5,0.5]))
  }
  else {
    let subjectCount
      if (isPublishCourse){
        subjectCount = weighted.select([1,2],[0.7,0.3])
        subjectCount = 2
      }
      else {
        // subjectCount = weighted.select([1,2,3],[0.6,0.3,0.1])
        subjectCount = weighted.select([2,3],[0.5,0.5])
      }
      subjects = getSecondarySubjects(subjectCount)
  }

  subjects = [].concat(subjects) // coerce to array just in case

  // This lets all routes except AO have part time courses - unsure if this is right
  const duration = (route == 'Assessment only') ? 1 : parseInt(weighted.select({
    '1': 0.8, // assume most courses are 1 year
    '2': 0.15,
    '3': 0.05
  }))

  // Full time
  if (duration == 1){
    studyMode = "Full time"
    // If early years or AO, just use route defaults
    // Todo: extend this to add academic qualifications possible for early years
    if (route.includes('Early years') || route.includes('Assessment only')){
      qualifications = enabledRoutes[route].qualifications
      qualificationsSummary = enabledRoutes[route].qualificationsSummary
    }
    else {
      let selected = weighted.select({
        'one': 0.2,   // QTS
        'two': 0.75,  // QTS with PGCE
        'three': 0.05 // QTS with PGDE
      })
      qualifications = qualificationOptions[selected].qualifications
      qualificationsSummary = qualificationOptions[selected].qualificationsSummary
    }
    
  }
  // Part time
  else {
    studyMode = "Part time"
    if (route.includes('Early years')){
      qualifications = enabledRoutes[route].qualifications
      qualificationsSummary = enabledRoutes[route].qualificationsSummary
    }
    else {
      let selected = weighted.select({
        'four': 0.2,  // QTS
        'five': 0.8   // QTS with PGDE
      })
      qualifications = qualificationOptions[selected].qualifications
      qualificationsSummary = qualificationOptions[selected].qualificationsSummary
    }
  }

  // PE only has allocated places
  let allocatedPlace
  if (trainingRouteData.trainingRoutes[route].hasAllocatedPlaces && subjects[0] == "Physical education"){
    allocatedPlace = true
  }

  // Assume most courses start in Autumn
  let startMonth = faker.helpers.randomize([8,9,10]) // August, September, October
  let startYear = params.startYear || new Date().getFullYear() // Current year
  let startDate = moment(`${startYear}-${startMonth}-01`, "YYYY-MM-DD").toDate()
  
  // Assume courses end earlier than they start
  const endDate = moment(startDate).add(duration, 'years').subtract(3, 'months').toDate()

  const code = generateCourseCode()

  const id = faker.random.uuid()

  if (isPublishCourse) {
    return {
      ...(ageRange ? { ageRange } : {}), // conditionally return age range
      allocatedPlace,
      code,
      duration,
      endDate,
      id,
      isPublishCourse,
      level,
      qualifications,
      qualificationsSummary,
      route,
      startDate,
      studyMode,
      subjects,
    }
  }

  else {
    return {
      ...(ageRange ? { ageRange } : {}), // conditionally return age range
      allocatedPlace,
      duration,
      endDate,
      isPublishCourse,
      level,
      qualifications,
      qualificationsSummary,
      route,
      startDate,
      subjects,
    }
  }

  
}
