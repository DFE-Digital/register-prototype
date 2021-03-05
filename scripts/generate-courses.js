// To generate new records:

// node scripts/generate-courses.js
// Re-run generate-records.js after generating new courses

const fs      = require('fs')
const path    = require('path')
const faker   = require('faker')
faker.locale  = 'en_GB'
const weighted = require('weighted')
const moment  = require('moment')
const _       = require('lodash')
const providerData = require('../app/data/providers')
const providers = providerData.selectedProviders

const ittSubjects = require('../app/data/itt-subjects')

const generateCourseDetails = require('../app/data/generators/course-generator')

// Volumes loosely based on number of courses per provider as seen on Publish
// Most have 1-3, but then about 1/3 have up to 80
const generateCourseCount = () => {
  let count = weighted.select({
    // "1": 0.2,
    // "2": 0.2,
    // "3": 0.05,
    // "4": 0.05,
    // "5": 0.05,
    // "7": 0.05,
    // "15": 0.05,
    "20": 0.05,
    "25": 0.05,
    "30": 0.05,
    "50": 0.05,
    "60": 0.05,
    "70": 0.05,
    "80": 0.05
  })
  return parseInt(count)
}

const generateFakeCourses = () => {
  let courses = {}

  providers.forEach(provider => {
    let providerCourses = []
    let courseCount = generateCourseCount() // semi-random number of courses per provider
    
    // Hardcode lots courses our default providers
    // A separate setting limits this later so that we can quickly change the number of courses
    if (provider == "Coventry University" || provider == "University of Buckingham") courseCount = 100

    for (var i = 0; i < courseCount; i++){
      providerCourses.push(generateCourseDetails({isPublishCourse: true}))
    }
    courses[provider] = {
      name: provider,
      courses: providerCourses
    }
  })

  return courses
}

/**
 * Generate JSON file
 *
 * @param {String} filePath Location of generated file
 * @param {String} count Number of courses to generate
 *
 */
const generateCoursesFile = (filePath) => {
  const courses = generateFakeCourses()
  // console.log(courses)
  console.log(`Generated fake courses`)
  const filedata = JSON.stringify(courses, null, 2)
  fs.writeFile(
    filePath,
    filedata,
    (error) => {
      if (error) {
        console.error(error)
      }
      console.log(`Course data generated: ${filePath}`)
    }
  )
}

generateCoursesFile(path.join(__dirname, '../app/data/courses.json'))
