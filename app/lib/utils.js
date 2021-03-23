// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _ = require('lodash')
const faker = require('faker')
const moment = require('moment')
const path = require('path')
const trainingRouteData = require('./../data/training-route-data')
const trainingRoutes = trainingRouteData.trainingRoutes

// -------------------------------------------------------------------
// General
// -------------------------------------------------------------------

// Cooerce falsy inputs to real true and false
// Needed as Nunjucks doesn't treat all falsy values as false
exports.falsify = (input) => {
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
  let subjectIsAllocated = allocatedSubjects.includes(_.get(record, 'courseDetails.subject'))
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

// This whole filter is poor and should probably be removed later.
exports.getSectionName = (record, section) => {
  if (section == 'trainingDetails'){
    if (record.status && record.status != "Draft"){
      return "Schools"
    }
    else {
      if (exports.requiresField(record, ['leadSchool', 'employingSchool'])){
        return "Trainee’s training details"
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
    let aString = `${a.subject} (${a.code})`
    let bString = `${b.subject} (${b.code})`
    return exports.sortAlphabetical(aString, bString)
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

// -------------------------------------------------------------------
// Records
// -------------------------------------------------------------------

// Check if all sections are complete
exports.recordIsComplete = record => {
  if (!record || !_.get(record, "route")) return false

  let requiredSections = _.get(trainingRoutes, `${record.route}.sections`)
  if (!requiredSections) return false // something went wrong

  let recordIsComplete = true
  requiredSections.forEach(section => {
    if (_.get(record, `${section}.status`) != "Completed"){
      recordIsComplete = false
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

// Look up a record using it’s UUID
exports.getRecordById = (records, id) => {
  return records.find(record => record.id == id)
}

// Utility function to filter by a key
// Basically identical to the ‘where’ filter
exports.filterRecordsBy = (records, key, array) => {
  array = [].concat(array) // force to array
  let filtered = records.filter(record => {
    return array.includes(record[key])
  })
  return filtered
}

// Look up several records using UUID
exports.getRecordsById = (records, array) => {
  return exports.filterRecordsBy(records, 'id', array)
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

// Sort by last name or draft record
exports.sortRecordsByLastName = records => {
  let sorted = records.sort((a, b) => {
    let aString = `${a?.personalDetails?.familyName}` || 'Draft record'
    let bString = `${b?.personalDetails?.familyName}` || 'Draft record'
    return exports.sortAlphabetical(aString, bString)
  })
  return sorted
}

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
  if (record.status != 'Draft'){
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

// Filter down a set of records for those that match provided filter object
exports.filterRecords = (records, data, filters = {}) => {

  let filteredRecords = records
  let applyEnabled = data.settings.enableApplyIntegration

  // Only allow records for the signed-in providers
  filteredRecords = exports.filterBySignedIn(filteredRecords, data)

  // Only show records for training routes that are enabled
  let enabledTrainingRoutes = data.settings.enabledTrainingRoutes

  // Only show records for currently enabled routes or draft records
  filteredRecords = filteredRecords.filter(record => enabledTrainingRoutes.includes(record.route) || (record?.status === 'Draft'))

  if (!applyEnabled){
    filteredRecords = filteredRecords.filter(record => record?.source != "Apply")
  }


  // Cycle not implimented yet
  // if (filter.cycle){
  //   filteredRecords = filteredRecords.filter(record => filter.cycle.includes(record.cycle))
  // }
  if (filters.providers){
    filteredRecords = filteredRecords.filter(record => filters.providers.includes(record.provider))
  }

  if (filters.trainingRoutes){
    filteredRecords = filteredRecords.filter(record => filters.trainingRoutes.includes(record.route))
  }

  if (filters.status){
    filteredRecords = filteredRecords.filter(record => filters.status.includes(record.status))
  }

  if (filters.subject && filters.subject != "All subjects"){
    filteredRecords = filteredRecords.filter(record => record?.courseDetails?.subject == filters.subject)
  }

  return filteredRecords
}

// -------------------------------------------------------------------
// Routing
// -------------------------------------------------------------------

// Append referrer to string if it exists
exports.getReferrer = referrer => {
  if (referrer && referrer != 'undefined'){
    return `?referrer=${referrer}`
  }
  else return ''
}

// Return first part of url to use in redirects
exports.getRecordPath = req => {
  let recordType = req.params.recordtype
  return (recordType == 'record') ? (`/record/${req.params.uuid}`) : '/new-record'
}
