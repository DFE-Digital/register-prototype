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

module.exports = (params) => {

  const isPublishCourse = (params.isPublishCourse) ? true : false

  const route = params.route || pickRoute(isPublishCourse)

  let level, qualifications, qualificationsSummary, studyMode

  if (route.includes('Early years')){
    level = 'Primary'
  }
  else level = faker.helpers.randomize(['Primary', 'Secondary'])

  const ageRange = faker.helpers.randomize(trainingRouteData.levels[level].ageRanges)

  let subject

  if (route.includes('Early years')){
    subject = 'Primary'
  }
  else if (level == 'Primary'){
    subject = faker.helpers.randomize(ittSubjects.primarySubjects)
  }
  else {
      // Bias slightly towards specific subjects but have some random
      // ones too for good measure
      subject = faker.helpers.randomize([
      "English",
      "Maths",
      "Physics",
      "Chemistry",
      "Physical education", // included to test allocations
      faker.helpers.randomize(ittSubjects.secondarySubjects),
      faker.helpers.randomize(ittSubjects.secondarySubjects),
      faker.helpers.randomize(ittSubjects.secondarySubjects),
    ])
  }

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
  if (trainingRouteData.trainingRoutes[route].hasAllocatedPlaces && subject == "Physical education"){
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
      ageRange,
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
      subject,
    }
  }

  else {
    return {
      ageRange,
      allocatedPlace,
      duration,
      endDate,
      isPublishCourse,
      level,
      qualifications,
      qualificationsSummary,
      route,
      startDate,
      subject,
    }
  }

  
}
