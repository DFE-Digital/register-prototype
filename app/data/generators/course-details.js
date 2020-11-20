// Generates fake course details
// Used to either simulate courses provided by publishers, or to populate
// data used in our seed records


const moment = require('moment')
const weighted = require('weighted')
const faker   = require('faker')
faker.locale  = 'en_GB'
const trainingRouteData = require('./../training-route-data')
const ittSubjects = require('./../itt-subjects')

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
let qualificationOptions = {
  'one': {
    qualifications: ['QTS'],
    summary: 'QTS'
  },
  'two': {
    qualifications: ['QTS', 'PGCE'],
    summary: 'PGCE with QTS full time'
  },
  'three': {
    qualifications: ['QTS', 'PGDE'],
    summary: 'PGDE with QTS full time'
  },
  'four': {
    qualifications: ['QTS'],
    summary: 'QTS part time'
  },
  'five': {
    qualifications: ['QTS', 'PGDE'],
    summary: 'PGDE with QTS part time'
  }
}

// These names need to align with those in training-route-data.js
const pickRoute = (isPublishCourse = false) => {
  if (isPublishCourse){
    return faker.helpers.randomize([
      'School direct salaried',
      'School direct tuition fee',
      'Apprenticeship PG',
      'Provider-led'
      // 'Higher education programme', // falls under provider led
      // 'SCITT programme'  // falls under provider led
    ])
  }
  else {
    return faker.helpers.randomize([
      'Provider-led',
      'Assessment only',
      'Teach first PG',
      // 'Early years - grad amp',
      'Early years - grad entry',
      // 'Early years - assessment only',
      'Early years - undergraduate',
      'Opt in undergraduate'
    ])
  }
}

module.exports = (params) => {

  const isPublishCourse = (params.isPublishCourse) ? true : false

  const route = params.route || pickRoute(isPublishCourse)

  let level, qualifications, summary, studyMode

  if (route.includes('Early years')){
    level = 'primary'
  }
  else level = faker.helpers.randomize(['primary', 'secondary'])

  const ageRange = faker.helpers.randomize(trainingRouteData.levels[level].ageRanges)

  let subject
  if (level == 'primary'){
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

  const duration = (route == 'Assessment only') ? 1 : parseInt(weighted.select({
    '1': 0.8, // assume most courses are 1 year
    '2': 0.15,
    '3': 0.05
  }))

  // Full time
  if (duration == 1){
    studyMode = "Full time"
    let selected = weighted.select({
      'one': 0.2,   // QTS
      'two': 0.75,  // QTS with PGCE
      'three': 0.05 // QTS with PGDE
    })
    if (route == 'Assessment only') selected = 'one'
    qualifications = qualificationOptions[selected].qualifications
    summary = qualificationOptions[selected].summary
  }
  // Part time
  else {
    studyMode = "Part time"
    let selected = weighted.select({
      'four': 0.2,  // QTS
      'five': 0.8   // QTS with PGDE
    })
    qualifications = qualificationOptions[selected].qualifications
    summary = qualificationOptions[selected].summary
  }

  // PE only has allocated places
  let allocatedPlace = (subject == "Physical education") ? "Yes" : undefined // assume PE is always allocated

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
      id,
      isPublishCourse,
      route,
      code,
      level,
      ageRange,
      subject,
      startDate,
      duration,
      endDate,
      qualifications,
      summary,
      studyMode
    }
  }

  else {
    return {
      isPublishCourse,
      route,
      level,
      ageRange,
      subject,
      startDate,
      duration,
      endDate,
      allocatedPlace,
      qualifications,
      summary
    }
  }

  
}
