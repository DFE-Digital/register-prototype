// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _ = require('lodash')
const faker = require('faker')
const moment = require('moment')
const path = require('path')
const url = require('url')
const trainingRouteData = require('./../data/training-route-data')
const trainingRoutes = trainingRouteData.trainingRoutes
const arrayFilters = require('./../filters/arrays.js').filters
const ittSubjects = require('./../data/itt-subjects')

// -------------------------------------------------------------------
// General
// -------------------------------------------------------------------

// Cooerce falsy inputs to real true and false
// Needed as Nunjucks doesn't treat all falsy values as false
exports.falsify = (input) => {
  if (input == undefined) return false
  if (_.isNumber(input)) return input
  else if (input == false) return false
  if (_.isString(input)){
    let truthyValues = ['yes', 'true']
    let falsyValues = ['no', 'false']
    if (truthyValues.includes(input.toLowerCase())) return true
    else if (falsyValues.includes(input.toLowerCase())) return false
  }
  return input;
}

// Sort two things alphabetically, not case-sensitive
exports.sortAlphabetical = (x, y) => {
  if(x.toLowerCase() !== y.toLowerCase()) {
    x = x.toLowerCase();
    y = y.toLowerCase();
  }
  return x > y ? 1 : (x < y ? -1 : 0);
}

// Loosely copied from /lib/utils
// Allows a template to live at 'foo/index' and be served from 'foo'
// The kit normally does this by defualt, but not if you want to do your
// own GET / POST routes
exports.render = (path, res, next, ...args) => {

  // Try to render the path
  res.render(path, ...args, function (error, html) {
    if (!error) {
      // Success - send the response
      res.set({ 'Content-type': 'text/html; charset=utf-8' })
      res.end(html)
      return
    }
    if (!error.message.startsWith('template not found')) {
      // We got an error other than template not found - call next with the error
      next(error)
      return
    }
    if (!path.endsWith('/index')) {
      // Maybe it's a folder - try to render [path]/index.html
      exports.render(path + '/index', res, next, ...args)
      return
    }
    // We got template not found both times - call next to trigger the 404 page
    next()
  })
}

// -------------------------------------------------------------------
// Course / route / programme
// -------------------------------------------------------------------

// Check if the course has allocated places
exports.hasAllocatedPlaces = (record) => {
  let routeHasAllocatedPlaces = (_.get(trainingRoutes, `[${record.route}]hasAllocatedPlaces`) == true)
  let allocatedSubjects = trainingRouteData.allocatedSubjects
  let subjectIsAllocated = allocatedSubjects.includes(_.get(record, 'courseDetails.subjects'))
  return (routeHasAllocatedPlaces && subjectIsAllocated)
}

// Check if the course route requires this field or any of these fields
exports.requiresField = (record, fieldNames) => {
  fieldNames = [].concat(fieldNames) // Force to array
  let route = record.route
  if (!route) {
    console.log("Missing route in requiresField")
    return false
  }
  let requiredFields = trainingRoutes[route]?.fields
  return (requiredFields) ? requiredFields.some(field => fieldNames.includes(field)) : false
}

// Check if the course route requires this section or any of these sections
exports.requiresSection = (record, sectionNames) => {
  sectionNames = [].concat(sectionNames) // Force to array
  let route = record.route
  let requiredSections
  if (route) {
    requiredSections = trainingRoutes[route]?.sections
  }
  else {
    console.log("No route provided, using default sections")
    // This is a fallback so drafts still work _mostly_ during development
    requiredSections = trainingRouteData.defaultSections
  }
  return requiredSections.some(section => sectionNames.includes(section))
}

// Returns: false / Early years / Primary / Secondary
// Todo: should this be explicitly set on the record?
exports.getCourseLevel = record => {

  let levels = trainingRouteData.levels

  let matchedLevel

  // Defer to an explicit level if it exists - not all records have this
  if (record?.courseDetails?.level) matchedLevel = record?.courseDetails?.level

  // Early years routes don’t have an age range - but they’re all implicitly 'Early years'
  else if (record?.route && record?.route.includes("Early years")) matchedLevel = "Early years"

  // Age range can be used to derive the level
  else if (record?.courseDetails?.ageRange) {
    matchedLevel = Object.keys(levels).filter(level => Array.isArray(levels[level]?.ageRanges) && levels[level].ageRanges.includes(record.courseDetails.ageRange)).pop()
  }
  else return false

  return matchedLevel
}

// -------------------------------------------------------------------
// Funding - initiatives and bursaries
// -------------------------------------------------------------------

exports.hasInitiatives = (record) => {
  let route = record?.route
  if (route && trainingRoutes[route].initiatives){
    return trainingRoutes[route].initiatives.length > 0
  }
  else return false
}

exports.isOnInitiative = record => {
  return record?.funding?.initiative != 'Not on a training initiative'
}

exports.subjectToAllocationSubject = subject => {
  if(!subject){
    console.log("Err: subject missing")
    return false
  }
  let allocationSubject = ittSubjects.subjectSpecialisms?.[subject]?.allocationSubject || false
  return allocationSubject
}

exports.getAllocationSubject = input => {
  // Support passing in a course or a record
  let courseSubject = input?.subjects || input?.courseDetails?.subjects || []
  if (courseSubject.length == 0){
    console.log('No course subject available')
    return false
  }
  else {
    let allocationSubject = exports.subjectToAllocationSubject(courseSubject[0])
    return allocationSubject
  }
}


// Internal helper to look up bursary available
exports.getBursaryByRouteAndSubject = (route, subject) => {
  let bursary = {}

  if (!route) return false
  let routeData = trainingRoutes[route]

  if (!routeData?.bursariesAvailable) return false

  let bursaryMatch = false

  bursary.allSubjects = []

  routeData.bursaries.forEach(bursaryLevel => {

    // Build up an array of subjects that attract a bursary
    bursary.allSubjects = bursary.allSubjects.concat(bursaryLevel.subjects)

    if (subject && bursaryLevel.subjects.includes(subject)) {
      bursary.value = bursaryLevel.value
      bursary.subjects = bursaryLevel.subjects
      bursary.subject = subject
      bursaryMatch = true
      return
    }
    // Early years don’t really have subjects - but we can check the route instead
    // Todo: should we just copy over the entire object?
    else if (route.includes("Early years") && bursaryLevel.subjects.includes("Early years")){
      bursary.value = bursaryLevel.value
      bursary.subjects = bursaryLevel.subjects
      bursary.subject = "Early years"
      bursary.tiersApply = bursaryLevel?.tiersApply || false
      if (bursary.tiersApply){
        bursary.tiers = bursaryLevel.tiers
      }
      bursaryMatch = true
      return
    }
  })

  let output = bursaryMatch ? bursary : false

  return output
}

// Look up available bursary for the current record
exports.getBursary = record => {
  if (!record) return false

  // Allocation subject may be falsy. For some routes this will mean we can’t calulate the bursary
  // for Early years, it doesn't matter
  let allocationSubject = exports.getAllocationSubject(record) 
  return exports.getBursaryByRouteAndSubject(record.route, allocationSubject)
}

exports.getBursaryValue = record => {
  return exports.getBursary(record).value || false
}

exports.routeHasBursaries = route => {
  if (!route) return false
  return trainingRoutes[route]?.bursariesAvailable || false
}

exports.bursariesApply = (record) => {
  let bursary = exports.getBursary(record)
  if (bursary) return true
  else return false
}

exports.canStartFundingSection = record => {
  if (!exports.routeHasBursaries(record?.route)) return true
  // Early years routes with bursaries need no extra info
  else if (record?.route.includes("Early years")) return true
  // Other routes need course details to start bursaries
  else {
    let courseDetailsComplete = exports.sectionIsComplete(record.courseDetails)
    return courseDetailsComplete
  }
}


// This whole filter is poor and should probably be removed later.
exports.getSectionName = (record, section) => {
  if (section == 'trainingDetails'){
    if (record.status && !exports.isDraft(record)){
      return "Schools"
    }
    else {
      if (exports.requiresField(record, ['leadSchool', 'employingSchool'])){
        return "Training details"
      }
      else return "Trainee start date and ID"
    }
  }
}

// Check if qualifications array contains an item
exports.qualificationIs = (record, qualification) => {
  return (record?.courseDetails?.qualifications) ? record.courseDetails.qualifications.includes(qualification) : false
}

exports.qualificationIsQTS = record => exports.qualificationIs(record, "QTS")

exports.qualificationIsEYTS = record => exports.qualificationIs(record, "EYTS")

exports.qualificationIsPGCE = record => exports.qualificationIs(record, "PGCE")

exports.qualificationIsPGDE = record => exports.qualificationIs(record, "PGDE")

exports.getQualificationText = record => {
  if (exports.qualificationIsEYTS(record)) return "EYTS"
  else if (exports.qualificationIsQTS(record)) return "QTS"
  else return "Unknown"
}

// Sort by subject, including course code
exports.sortPublishCourses = courses => {
  let sorted = courses.sort((a, b) => {
    return exports.sortAlphabetical(exports.getCourseName(a), exports.getCourseName(b))
  })
  return sorted
}

// Return courses run by the current provider
// If run as a filter, data comes via Nunjucks context. If run from elsewhere,
// we need to explicitly pass in data.
exports.getProviderCourses = function(courses, provider, route=false, data=false){
  data = data || this?.ctx?.data || false
  if (!data) {
    console.log("Error with getProviderCourses: session data not provided")
  }
  if (!provider) {
    console.log('Error: no provider given')
  }
  let filteredCourses = data.courses[provider].courses
  if (route) {
    filteredCourses = filteredCourses.filter(course => route == course.route)
  }
  let limitedCourses = filteredCourses.slice(0, data.settings.courseLimit)
  let sortedCourses = exports.sortPublishCourses(limitedCourses)
  return sortedCourses
}

// Check if the selected provider offers publish courses for the selected route
exports.routeHasPublishCourses = function(record){
  if (!record) return false
  const data = Object.assign({}, this.ctx.data)
  let providerCourses = exports.getProviderCourses(data.courses, record?.provider, record.route, data)
  return (providerCourses.length > 0)
}

// Lowercase array excluding some proper nouns
exports.dynamicLowercase = input => {
  if (!input) return input
  
  // These things shouldn’t get lowercased
  let ignoreSubjects = [
  "Arabic",
  "Chinese",
  "Early years",
  "English",
  "French",
  "German",
  "Greek",
  "Ancient Hebrew",
  "Italian",
  "Japanese",
  "Latin",
  "Mandarin",
  "Portuguese",
  "Russian",
  "Spanish",
  "Welsh",
  ]

  const makeLowercase = item => {
    let output = item.toLowerCase()

    ignoreSubjects.forEach(subject => {
      let regex = new RegExp(`${subject.toLowerCase()}`, "g") // match multiple times
      // Note: if we upgrade to node 16, we could use output.replaceAll instead
      output = output.replace(regex, subject)
    })
    return output
  }

  if (typeof input === 'string') {
    return makeLowercase(input)
  }
  else {
    let array = [].concat(input)
    return array.map(subject => {
      return makeLowercase(subject)
    })
  }

}

// Combine multiple subject names together
// Eg Biology with English, Chemistry with physical education and physics
// A bit similar to:
// https://github.com/DFE-Digital/teacher-training-api/blob/045a4b3e97df0ccdb72c38b3611dcb8d094c29cc/app/services/courses/generate_course_name_service.rb#L51
exports.prettifySubjects = (subjects, lowercaseFirst=false) => {
  // No data?
  if (!subjects || subjects.length == 0) {
    return ''
  }

  // A string or just one subject
  // Return straight away so we don’t shorten the string
  if (typeof subjects === 'string' || subjects.length == 1){
    if (lowercaseFirst) return exports.dynamicLowercase(subjects)
    else return subjects
  }

  // Shallow copy as we’re about to shift() the first item
  // Also do some cleanup on the data
  let subjectsCopy = [...subjects].map(subject => {
    return subject
      .replace('Primary teaching', 'Primary')
      .replace('Modern languages', '_modern_lang') // Temporarily rename this
      .replace(' languages', '') // Strip out languages from 'Chinese languages' etc
      .replace(' language', '') // Strip out language from 'English language' etc
      .replace('English studies', 'English') // Shorten this
      .replace('_modern_lang', 'Modern languages') // Restore 'Modern languages'
  })

  // Lowercase everything
  if (lowercaseFirst){
    subjectsCopy = exports.dynamicLowercase(subjectsCopy)
  }
  // Lowercase all the subjects except those starting with words in ignoreSubjects
  else {
    subjectsCopy = [subjectsCopy.shift()].concat(exports.dynamicLowercase(subjectsCopy))
  }

  // Join with ‘with’ and ‘and’
  // ‘a with b’ or ‘a with b and c’
  let returnString = arrayFilters.withSeparate(subjectsCopy)
  return returnString
}

// eg Biology (J482)
exports.getCourseName = (course) => {
  return `${exports.prettifySubjects(course.subjects)} (${course.code})`
}


// -------------------------------------------------------------------
// Records
// -------------------------------------------------------------------

// Statuses
exports.isDraft = record => {
  return record.status == "Draft" || record.status == "Apply draft"
}

exports.isNotDraft = record => {
  return record.status != "Draft" && record.status != "Apply draft"
}

exports.isPendingTrn = record => {
  return record.status == "Pending TRN"
}

exports.isTrnReceived = record => {
  return record.status == "TRN received"
}

exports.isRecommended = record => {
  return record.status.includes("recommended") //EYTS recommended and QTS recommended
}

exports.isAwarded = record => {
  return record.status.includs("awarded") // EYTS awarded and QTS awarded
}

exports.isDeferred = record => {
  return record.status == "Deferred"
}

exports.isWithdrawn = record => {
  return record.status == "Withdrawn"
}

// Source types
exports.sourceIsApply = record => {
  return record?.source == "Apply"
}

exports.sourceIsManual = record => {
  return record?.source != "Apply"
}

exports.sectionIsComplete = section => {
  return section?.status == "Completed" || (section?.status && section.status.includes("Completed"))
}

// Check if all sections are complete
exports.recordIsComplete = record => {
  if (!record || !_.get(record, "route")) return false

  let requiredSections = _.get(trainingRoutes, `${record.route}.sections`)
  let applyReviewSections = trainingRouteData.applyReviewSections

  if (!requiredSections) return false // something went wrong

  // All required sections must be marked completed
  let recordIsComplete = requiredSections.every(section => {

    let sectionStatus = record[section]?.status == "Completed"
    
    // Default
    if (exports.sourceIsManual(record)){
      return sectionStatus
    }

    // Special handling for Apply drafts which *may* work differently
    else if (exports.sourceIsApply(record)){

      // Some sections are collected together with one checkbox for all
      // If so, defer to that checkbox
      if (applyReviewSections.includes(section)){
        return (record.applyData.status == "Completed") || sectionStatus
      }
      else return sectionStatus
    }
    else {
      console.log("Error, record type not recognised")
    }
  })

  return recordIsComplete
}

// Checks if the placement criteria has been met
exports.needsPlacementDetails = function(record, data = false) {

  data = Object.assign({}, (data || this.ctx.data || false))

  let needsPlacementDetails = false
  let placementCount = (record?.placement?.items) ? record.placement.items.length : 0
  let minPlacementsRequired = data.settings.minPlacementsRequired

  if (exports.requiresSection(record, 'placement')) {
    if ((record?.placement?.status != 'Complete') || (placementCount < minPlacementsRequired)) {
      needsPlacementDetails = true
    }
  }
  return needsPlacementDetails
}

// Check if there are outsanding actions (Either adding start date or placements details)
exports.hasOutstandingActions = function(record, data = false) {

  data = Object.assign({}, (data || this.ctx.data || false))
  
  let hasOutstandingActions = false
  let traineeStarted = record?.trainingDetails?.commencementDate

  if (!traineeStarted) {
    hasOutstandingActions = true
  }
  else if (exports.needsPlacementDetails(record, data)) {
    hasOutstandingActions = true
  }
  return hasOutstandingActions
}


// -------------------------------------------------------------------
// Get records
// -------------------------------------------------------------------

// Look up a record using it’s UUID
exports.getRecordById = (records, id) => {
  return records.find(record => record.id == id)
}

// Look up several records using UUID
exports.getRecordsById = (records, array) => {
  return exports.filterRecordsBy(records, 'id', array)
}

// -------------------------------------------------------------------
// Filter records
// -------------------------------------------------------------------

// Filter down a set of records for those that match provided filter object
exports.filterRecords = (records, data, filters = {}) => {

  let filteredRecords = records
  let applyEnabled = data.settings.enableApplyIntegration

  // Only allow records for the signed-in providers
  filteredRecords = exports.filterBySignedIn(filteredRecords, data)

  // Only show records for training routes that are enabled
  let enabledTrainingRoutes = data.settings.enabledTrainingRoutes

  // Only show records for currently enabled routes or draft records
  filteredRecords = filteredRecords.filter(record => enabledTrainingRoutes.includes(record.route) || (exports.isDraft(record)))

  if (!applyEnabled){
    filteredRecords = filteredRecords.filter(record => exports.sourceIsManual(record))
  }


  // Cycle not implimented yet
  // if (filter.cycle){
  //   filteredRecords = filteredRecords.filter(record => filter.cycle.includes(record.cycle))
  // }

  if (filters.completeStatus){
    filteredRecords = filteredRecords.filter(record => {
      let completeStatus = (exports.recordIsComplete(record)) ? 'Complete' : 'Incomplete'
      return filters.completeStatus.includes(completeStatus)
    })
  }

  // Apply or manual
  if (filters.source){
    filteredRecords = filteredRecords.filter(record => filters.source.includes(record.source))
  }

  // Primary / Secondary etc
  if (filters.level){
    filteredRecords = filteredRecords.filter(record => filters.level.includes(exports.getCourseLevel(record)))
  }

  // List of providers if signed in as multiple
  if (filters.providers){
    filteredRecords = filteredRecords.filter(record => filters.providers.includes(record.provider))
  }

  if (filters.trainingRoutes){
    filteredRecords = filteredRecords.filter(record => filters.trainingRoutes.includes(record.route))
  }

  if (filters.status){
    filteredRecords = filteredRecords.filter(record => {

      // Special handling of Apply drafts so they get caught by the 'draft' filter
      // Avoiding using the 'isDraft' filter here so that 'Apply draft' can also be 
      // manually searched for
      if (record.status == "Apply draft" && filters.status.includes("Draft")){
        return true
      }
      else return filters.status.includes(record.status)
    })
  }

  if (filters.subject && filters.subject != "All subjects"){
    filteredRecords = filteredRecords.filter(record => {
      return record?.courseDetails?.subjects && record?.courseDetails?.subjects.includes(filters.subject)
    })
  }

  return filteredRecords
}

// Text search across a few selected fields
exports.filterRecordsBySearchTerm = (records, searchQuery=false) => {
  if (!searchQuery) return records

  let searchQueryLowercase = searchQuery.toLowerCase()

  let filteredRecords = records.filter(record => {
    let fullName = record?.personalDetails?.fullName.toLowerCase() || "" // Draft records might not have a full name

    // Check that every part exists in the trainee’s name
    let searchParts = searchQueryLowercase.split(' ')
    let nameMatch = searchParts.every(part => fullName.includes(part))

    let traineeIdMatch = searchParts.some(part => (record?.trainingDetails?.traineeId || "").toLowerCase().includes(part))

    let trnMatch = searchParts.some(part => (record?.trn || "").toString().includes(part))

    return traineeIdMatch || trnMatch || nameMatch
  })

  return filteredRecords
}

// Utility function to filter by a key
// Basically identical to the ‘where’ filter
exports.filterRecordsBy = (records, key, array) => {
  array = [].concat(array) // force to array
  let filtered = records.filter(record => {
    return array.includes(_.get(record, key))
  })
  return filtered
}

// Filter records for particular providers
exports.filterByProvider = (records, array) => {
  return exports.filterRecordsBy(records, 'provider', array)
}

// Filter records for currently signed in providers
// Can’t be an arrow function because we need access to the Nunjucks context
exports.filterBySignedIn = function(records, data=false){
  data = data || this?.ctx?.data || false
  if (!data) {
    console.log('Error with filterBySignedIn: session data not provided')
    return []
  }
  if (!Array.isArray(data.signedInProviders) || data.signedInProviders.length < 1){
    console.log('Error with filterBySignedIn: user doesn’t appear to be signed in to any providers')
    return []
  }
  return exports.filterByProvider(records, data.signedInProviders)
}

// Only records from a specific academic year or years
exports.filterByYear = (records, array) => {
  return exports.filterRecordsBy(records, 'academicYear', array)
}

// For use on drafts only?
exports.filterByComplete = records => {
  return records.filter(record => exports.recordIsComplete(record))
}

// For use on drafts only?
exports.filterByIncomplete = records => {
  return records.filter(record => !exports.recordIsComplete(record))
}

// -------------------------------------------------------------------
// Sort records
// -------------------------------------------------------------------

// Sort by a date
// Uses lodash.get so we can read nested properties
exports.sortRecordsByDate = (records, sortKey, reverse=false) => {
  records = records.sort((a, b) => new Date(_.get(b, sortKey)).getTime() - new Date(_.get(a, sortKey)).getTime())
  return (reverse) ? records.reverse() : records
}

// Sort records by thing. Tests for specific cases and otherwise falls back to string comparison of field
exports.sortRecordsBy = (records, sortType) => {

  const compareStrings = (a, b) => {
    if (a && b){
      return a.localeCompare(b)
    }
    else return (a) ? 1 : -1
  }

  if (!sortType) return records

  switch (sortType){
    case "lastName":
      records.sort( (a, b) => compareStrings(a?.personalDetails?.familyName, b?.personalDetails?.familyName))
      break
    case "firstName":
      records.sort( (a, b) => compareStrings(a?.personalDetails?.givenName, b?.personalDetails?.givenName))
      break
    case "updatedDate":
      records = exports.sortRecordsByDate(records, 'updatedDate')
      break
    default:
      console.log(`Sorting records by unknown type: ${sortType}`)
      records.sort( (a, b) => compareStrings(_.get(a, sortType), _.get(b, sortType)))
      break
  }

  return records

}

// Sort by last name
exports.sortRecordsByLastName = records => {
  return exports.sortRecordsBy(records, 'lastName')
}

// Sort by date updated
exports.sortRecordsByDateUpdated = records => {
  return exports.sortRecordsByDate(records, 'updatedDate')
}

// -------------------------------------------------------------------
// Misc
// -------------------------------------------------------------------


// Add an event to a record’s timeline
exports.addEvent = (record, content) => {
  record.events.items.push({
    title: content,
    user: 'Provider',
    date: new Date()
  })
}

// Delete temporary stores of data
exports.deleteTempData = (data) => {
  delete data.degreeTemp
  delete data.record
  delete data.submittedRecordId
  delete data.placementTemp
}

// Stolen from Manage
exports.getTimeline = (record) => {
  return record.events.items.map(item => {
    return {
      label: {
        text: item.title
      },
      datetime: {
        timestamp: item.date,
        type: 'datetime'
      },
      byline: {
        text: item.user
      }
      // link: getLink(item, record)
    }
  }).reverse()
}

// Update or create a record
// Todo: this function is overcomplicated. Make simpler!
exports.updateRecord = (data, newRecord, timelineMessage) => {

  if (!newRecord) return false

  let records = data.records
  newRecord.updatedDate = new Date()

  if (timelineMessage !== false){
    let message = (timelineMessage) ? timelineMessage : "Record updated"
    exports.addEvent(newRecord, message)
  }
  if (newRecord.addressType == "domestic"){
    delete newRecord?.contactDetails?.internationalAddress
  }
  if (newRecord.addressType == "international"){
    delete newRecord?.contactDetails?.address
  }
  data.record = newRecord

  if (newRecord.personalDetails){
    Object.defineProperty(newRecord.personalDetails, 'fullName', {
      get() {
        let names = []
        names.push(this.givenName)
        names.push(this.middleNames)
        names.push(this.familyName)
        return names.filter(Boolean).join(' ')
      },
      enumerable: true
    })
  }
  if (newRecord.personalDetails){
    Object.defineProperty(newRecord.personalDetails, 'shortName', {
      get() {
        let names = []
        names.push(this.givenName)
        names.push(this.familyName)
        return names.filter(Boolean).join(' ')
      },
      enumerable: true
    })
  }

  // All records should have a provider by this point
  if (!newRecord.provider){
    console.log(`Error in updateRecord - record has no provider`)
    if (data.signedInProviders.length == 1) { // One provider only
      newRecord.provider = data.signedInProviders[0] // Implicitly a 1 item array
    }
  }

  // Must be a new record
  if (!newRecord.id){
    newRecord.id = faker.random.uuid()
    records.push(newRecord)
  }
  // Is an existing record
  else {
    let recordIndex = records.findIndex(record => record.id == newRecord.id)
    records[recordIndex] = newRecord
  }
  return true
}

// Used by the bulk flows
exports.doBulkAction = (action, record, params) => {
  if (action == 'Submit a group of records and request TRNs'){
    return exports.registerForTRN(record)
  }
  if (action == 'Recommend a group of trainees for EYTS or QTS'){
    return exports.recommendForAward(record, params)
  }
}

// Advance a record to 'QTS recommended' status
exports.registerForTRN = (record) => {

  // Set default qualifcation, duration, etc
  // Publish course data may override this
  let routeData = trainingRoutes[record.route]
  let routeDefaults = {
    qualifications: routeData.qualifications,
    qualificationsSummary: routeData.qualificationsSummary,
    duration: routeData.duration
  }

  if (!record) return false

  // Only draft records can be submitted for TRN
  if (!exports.isDraft(record)){
    console.log(`Submit a group of records and request TRNs failed: ${record.id} (${record?.personalDetails?.shortName}) has the wrong status (${record.status})`)
    return false
  }

  // Hopefully we won't be supplied any records in the wrong status
  // Just in case though...
  else if (!exports.recordIsComplete(record)){
    console.log(`Submit a group of records and request TRNs failed: ${record.id} (${record?.personalDetails?.shortName}) is not complete`)
    return false
  }
  else {
    record.status = 'Pending TRN'
    record.source = record.source || "Manual" // just in case
    delete record?.placement?.status
    record.submittedDate = new Date()
    record.updatedDate = new Date()
    record.courseDetails = {
      ...routeDefaults,
      ...record.courseDetails
    }
    exports.addEvent(record, "Trainee submitted for TRN")
  }
  return true
}

// Advance a record to 'QTS recommended' status
exports.recommendForAward = (record, params) => {

  if (!record) return false
  if (record.status.includes('recommended')){
    // Nothing to do
  }
  else if (record.status != 'TRN received'){
    console.log(`Recommend a group of trainees for EYTS or QTS failed: ${record.id} (${record?.personalDetails?.shortName}) has the wrong status (${record.status})`)
    return false
  }
  else {
    record.status = `${exports.getQualificationText(record)} recommended`
    _.set(record, 'qualificationDetails.standardsAssessedOutcome', "Passed")
    record.qualificationRecommendedDate = record?.qualificationDetails?.outcomeDate || params?.date || new Date()
    record.updatedDate = new Date()
    exports.addEvent(record, `Trainee recommended for ${exports.getQualificationText(record)}`)
  }
  return true
}

// -------------------------------------------------------------------
// Invalid answers / errors
// -------------------------------------------------------------------

// Push an item to the errorArray
// Needs the context so if calling from another filter needs to be called with `.apply(this, [args])`
// Usage: exports.addToErrorArray.apply(this, [{name: message, id}])
exports.addToErrorArray = function(item){
  if (!this?.ctx?.data){
    console.log("Error with addToErrorArray: ctx not passed in")
    return false
  } 
  let errorArray = this.ctx?.data?.temp?.errorArray || []
  errorArray.push(item)
  _.set(this.ctx, 'data.temp.errorArray', errorArray)
}

// Remove placeholder tags that are used to trigger things
exports.stripPlaceholders = (value, items=false) => {
  if (!value) return value

  let itemsToStrip = items || [
    '**invalid**',
    '**missing**'
  ]

  const stripStrings = string => {
    if (!_.isString(string)) return string
    else itemsToStrip.forEach(item => {
      string = string.replace(item, "")
    })
    return string
  }

  if (Array.isArray(value)){
    return value.map(arrayItem => stripStrings(arrayItem))
  }
  else if (_.isString(value)){
    return stripStrings(value)
  }
  else return value
}

/*
Highlight invalid summary list rows

This is filter patches in the ability to highlight rows on a summary list which
contain invalid answers. 

We indicate invalid answers by prefacing them with the string **invalid** or **missing**

This filter loops through each row, looking for this string in value.html or value.text.
If found, it adds some classes and messaging, and moves the action link within the value.

It also pushes the name of the row with the error to a temporary array stored
in the Nunjucks context. This is a hacky way that we can get a list of each of the 
errors visible in a set of summary lists without knowing about the data structure of a
record. The very act of running this filter on each summary list builds up this array.
We can then use that array to display a summary at the top of the page. This is combined
with a catch all route (*) that wipes the array with each request - so it should only
have items found since the last request.

This is very hacky - but works. It avoids us needing to know much about the data
or program errors per field. We just reivew the summary list to decide if something
is wrong.
*/
exports.highlightInvalidRows = function(rows) {
  let ctx = Object.assign({}, this.ctx)

  // We need to add to any existing answers from previous times
  // this filter has run on this page
  // let invalidAnswers = ctx.data?.temp?.invalidAnswers || []
  let featureEnabled = ctx.data?.settings?.highlightInvalidAnswers == "true"

  if (rows) {
    // Loop through each row
    rows.map(row => {

      // Values are stored two possible places
      let value = row?.value?.html || row?.value?.text
      
      if (featureEnabled){

        // We preface invalid answers with **invalid** but technically it sohuld work anywhere
        // Probably might not work for dates / values that get transformed before display
        if (value && value.includes('**invalid**')) {
          // Using .apply() to pass on value of 'this'
          row = exports.markSummaryRowInvalid.apply(this, [row])
        }

        if (value && value.includes('**missing**')) {
          // Using .apply() to pass on value of 'this'
          row = exports.markSummaryRowMissing.apply(this, [row])
        }

      }
      // If feature not enabled, we still need to strip placeholders
      else {
        row.value.html = exports.stripPlaceholders(value)
        delete row.value?.text // not needed any more
      }

      return row
    })
  }

  return rows
}

// Internal utility function to add markup to summary row to show visually inset styles
const styleSummaryRowAsInset = (row, params) => {

  // Keys are stored two possible places
  let key = row?.key?.html || row?.key?.text

  // GOVUK summary lists don’t support setting an id on rows
  // so we wrap the key in a div with our own id
  row.key.html = (params.id) ? `<div id="${params.id}">${key}</div>` : key
  delete row.key?.text

  // Message that gets shown in bold
  let messageHtml = (params.message) ? `<p class="govuk-body app-summary-list__message--invalid govuk-!-margin-bottom-2">${params.message}</p>` : ''

  // Grab the existing action link and craft a new link
  let linkHtml = '' // default to no link
  let actionItems = row?.actions?.items

  // If there’s more than one link (unlikely), do nothing
  if (actionItems && actionItems.length == 1){
    let href = row?.actions?.items[0].href
    let hidden = (params.linkTextAppendHidden) ? `<span class="govuk-visually-hidden"> ${params.linkTextAppendHidden}</span>` : ""
    linkHtml = `<div>
    <a class="govuk-link govuk-link--no-visited-state app-summary-list__link--invalid" href="${href}">
    ${params.linkText}${hidden}
    </a></div>`
    delete row.actions.items
  }

  // Add a class to the row so we can target it
  row.classes = `${row.classes} app-summary-list__row--invalid`

  // Wrap in a div for styling
  // Values are stored two possible places
  let value = row?.value?.html || row?.value?.text
  let userValueHtml = (value) ? `<div class="app-summary-list__user-value">${value}</div>` : ""

  // Entire thing is wrapped in a div so we can style a left border within the padding of the
  // summary list value box

  row.value.html = `<div class="app-summary-list__value-inset">${messageHtml}${userValueHtml}${linkHtml}</div>`
  delete row?.value?.text // just in case

  return row
}

// Generate messages to be used in inset styling
// Type can be `invalid` or `missing`
exports.markSummaryRow = function(row, type) {

  // Keys are stored two possible places
  let key = row?.key?.html || row?.key?.text

  // Values are stored two possible places
  let value = row?.value?.html || row?.value?.text
  delete row?.value?.text // we’ll use row.value.html instead
  row.value.html = exports.stripPlaceholders(value) // strip any placeholder tags

  // Generate an id so we can anchor to this row
  let id = `summary-list--row-invalid--${faker.random.uuid()}`

  let message, linkText, linkTextAppendHidden

  if (type == 'invalid'){
    message = `${key} is not recognised`
    linkText = "Review the trainee’s answer"
    linkTextAppendHidden = `for ${key.toLowerCase()}`

    // Using .apply() to pass on value of 'this'
    exports.addToErrorArray.apply(this, [{name: message, id}])
  }
  else if (type == 'missing'){
    message = `${key} is missing`
    delete row.value?.html // if it’s missing, there shouldn’t be a value
    linkText = `Enter ${key.toLowerCase()}`
    if (this?.ctx?.query?.errors){
      // Using .apply() to pass on value of 'this'
      exports.addToErrorArray.apply(this, [{name: message, id}])
    }
  }

  row = styleSummaryRowAsInset(row, {
    id,
    message,
    linkText,
    linkTextAppendHidden
  })

  return row
}

exports.markSummaryRowInvalid = function(row) {
  // Using .apply() to pass on value of 'this'
  return exports.markSummaryRow.apply(this, [row, 'invalid'])
}

exports.markSummaryRowMissing = function(row) {
  // Using .apply() to pass on value of 'this'
  return exports.markSummaryRow.apply(this, [row, 'missing'])
}


exports.markInput = function(data, type){
  // Keys are stored two possible places
  let key = data?.label?.html || data?.label?.text || data?.fieldset?.legend?.html || data?.fieldset?.legend?.text

  // Values are stored two possible places
  let valueCleaned = exports.stripPlaceholders(data.value) // strip any placeholder tags

  // Generate an id so we can anchor to this row
  let id = data?.id || `app-input-invalid--${faker.random.uuid()}`

  let message

  if (type == 'error'){
    message = `Enter ${key.toLowerCase()}`
    data.errorMessage = {
      text: message
    }
    data.value = valueCleaned
    // Using .apply() to pass on value of 'this'
    exports.addToErrorArray.apply(this, [{name: message, id}])
  }
  else if (type == 'invalid'){
    message = `${key} is not recognised`
    data.errorMessage = {
      text: `The trainee entered ‘${valueCleaned}’. You need to search for the closest match.`
    }
    data.classes = (data.classes) ? `${data.classes} app-invalid-answer` : 'app-invalid-answer'
    delete data.value
    // Using .apply() to pass on value of 'this'
    exports.addToErrorArray.apply(this, [{name: message, id}])
  }
  else if (type == 'missing'){
    message = `${key} is missing`
    
    data.errorMessage = {
      text: message
    }
    data.classes = (data.classes) ? `${data.classes} app-invalid-answer` : 'app-invalid-answer'
    delete data.value
  }

  data.id = id

  return data
}

exports.markInputError = function(data) {
  return exports.markInput.apply(this, [data, 'error'])
} 

exports.markInputInvalid = function(data) {
  return exports.markInput.apply(this, [data, 'invalid'])
} 

exports.markInputMissing = function(data) {
  return exports.markInput.apply(this, [data, 'missing'])
} 
// Take in a form object to 

exports.highlightInvalidInputs = function(data){

  let value = data.value

  if (value && value.includes('**invalid**')) {
    // Using .apply() to pass on value of 'this'
    data = exports.markInput.apply(this, [data, 'invalid'])
  }

  if (value && value.includes('**missing**')) {
    // Using .apply() to pass on value of 'this'
    data = exports.markInput.apply(this, [data, 'missing'])
  }

  return data
}

// Count invalid or missing answers on a record
exports.countInvalidAnswers = function(record, data=false) {
  // Prefer context if available
  // This will pick up dynamically generated errors, but only
  // works within a view
  if (this.ctx){
    // console.log('Counting invalid answers with CTX')
    let errorArray = this.ctx?.data.temp?.errorArray || []
    return errorArray.length
  }
  // The context is not available from routes - so use record data as fallback
  // This count could be wrong if errors have been added dynamically - it can only
  // pick up records that include the placeholder strings
  else {
    // console.log('Counting invalid answers with json')
    let jsonRecord = JSON.stringify(record)
    let invalidCount = (jsonRecord.match(/\*\*invalid\*\*/g) || []).length
    let missingCount = (jsonRecord.match(/\*\*missing\*\*/g) || []).length
    return (invalidCount + missingCount)
  }
}

// Whether any data in the record is considered invalid
exports.hasInvalidAnswers = function(record, data=false) {
  // A page can set this temp variable to 'tell' this filter that errors
  // apply - otherwise fall back to counting errors
  let hasErrors
  if (data?.temp?.pageHasErrors == "true") hasErrors = true
  return hasErrors || exports.countInvalidAnswers.apply(this, [record]) > 0
}

// -------------------------------------------------------------------
// Schools
// -------------------------------------------------------------------

// This approximates a similar search as we do client side with Lunr
exports.searchSchools = (schools = [], query = "") => {
  if (!query) return []

  // Strip most punctuation for fuzzier matching
  const removePunctuation = input => input.replace(/['’‘.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")

  let queryParts = removePunctuation(query.toLowerCase()).split(" ")

  let results = schools.filter(school => {

    // All parts must match
    return queryParts.every(part => {
      let match = false
      let simpleSchoolName = removePunctuation(school.schoolName).toLowerCase()

      // 849382
      if (school.urn.includes(part)) match = true
      // Abbeywood School
      if (simpleSchoolName.includes(part)) match = true
      // Postcode with spaces
      if (school.postcode && school.postcode.toLowerCase().includes(part)) match = true
      // Postcode without spaces
      if (school.postcode && school.postcode.toLowerCase().replace(" ", "").includes(part)) match = true
      return match

    })
  })
  return results
}

// -------------------------------------------------------------------
// Routing
// -------------------------------------------------------------------

// Adds referrer as query string if it exists
exports.addReferrer = (url, referrer) => {
  if (!referrer || referrer == undefined) return url
  else {
    return `${url}?referrer=${referrer}`
  }
}

exports.orReferrer = (url, referrer) => {
  if (!referrer || referrer == undefined) return url
  else {
    return exports.getReferrerDestination(referrer)
  }
}

exports.pushReferrer = (existingReferrer, newReferrer) => {
  if (!existingReferrer) return newReferrer
  else {
    return [].concat(existingReferrer).concat(newReferrer)
  }
}

// Append referrer to string if it exists
exports.getReferrer = referrer => {
  if (referrer && referrer != 'undefined'){
    return `?referrer=${referrer}`
  }
  else return ''
}

// Appends a query param to an optional existing one
// Used so we can add query params whilst also providing a referrer
exports.addQueryParam = (existing, param) => {
  return (existing) ? `${existing}&${param}` : `?${param}`
}

exports.setQueryParam = (query, key, value) => {
  let newQuery = Object.assign({}, query)
  _.set(newQuery, key, value)
  return newQuery
}

// Combine pathname and query
exports.makeUrlWithQuery = (pathname, query) => {
  return url.format({
    pathname,
    query: query,
  })
}

// Update the current query with sort order set
exports.createSortLink = function(pathname, sortOrder){
  let ctx = Object.assign({}, this.ctx)
  let query = ctx.query
  query = exports.setQueryParam(query, 'sortOrder', sortOrder)
  return exports.makeUrlWithQuery(pathname, query)
}

// Referrer could be an array of urls. If so, return the last one
// and put the remaining as the next referrer.
// This lets us support multiple return destinations
exports.getReferrerDestination = referrer => {
  if (typeof referrer == 'string'){
    referrer = referrer.split(",")
  }
  if (!referrer) return ''
  else if (Array.isArray(referrer)){
    let referrerCopy = [...referrer]
    let last = referrerCopy.pop()
    if (referrerCopy.length) return `${last}?referrer=${referrerCopy}`
    else return last
  }
  else return referrer
}

// Return first part of url to use in redirects
exports.getRecordPath = req => {
  let recordType = req.params.recordtype
  return (recordType == 'record') ? (`/record/${req.params.uuid}`) : '/new-record'
}
