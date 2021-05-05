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
  return record.source == "Apply"
}

exports.sourceIsManual = record => {
  return record.source == "Manual"
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

// Invalid answers have `**invalid**` prepended to them
// Count how many times this string exists in the record
// As users edit these answers, this string should get removed
// so the count should go down
exports.countInvalidAnswers = record => {
  let jsonRecord = JSON.stringify(record)
  let invalidCount = (jsonRecord.match(/\*\*invalid\*\*/g) || []).length
  return invalidCount
}

// Whether any data in the record is considered invalid
exports.hasInvalidAnswers = record => {
  return exports.countInvalidAnswers(record) > 0
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
  filteredRecords = filteredRecords.filter(record => enabledTrainingRoutes.includes(record.route) || (exports.isDraft(record)))

  if (!applyEnabled){
    filteredRecords = filteredRecords.filter(record => exports.sourceIsManual(record))
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
    filteredRecords = filteredRecords.filter(record => record?.courseDetails?.subject == filters.subject)
  }

  return filteredRecords
}

/*
Highlight invalid summary list rows

This is filter patches in the ability to highlight rows on a summary list which
contain invalid answers. 

We indicate invalid answers by prefacing them with the string **invalid**

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

// Must be classic function as arrow functions don't provide the Nunjucks context
exports.highlightInvalidRows = function(rows) {
  let ctx = Object.assign({}, this.ctx)

  // We need to add to any existing answers from previous times
  // this filter has run on this page
  let invalidAnswers = ctx.data?.record?.invalidAnswers || []
  let featureEnabled = ctx.data?.settings?.highlightInvalidAnswers == "true"

  if (rows) {
    rows.map(row => {

      // Values are stored two possible places
      let value = row?.value?.html || row?.value?.text

      // We preface invalid answers with **invalid** but technically it sohuld work anywhere
      // Probably might not work for dates / values that get transformed before display
      if (value && value.includes('**invalid**') ){

        // Strip **invalid** so it doesn’t display
        let userValue = value.replace("**invalid**", "")

        if (featureEnabled){

          // Keys are stored two possible places
          let key = row?.key?.html || row?.key?.text

          // Generate an id so we can anchor to this row
          let id = `summary-list--row-invalid-${invalidAnswers.length + 1}`

          // GOVUK summary lists don’t support setting an id on rows
          // so we wrap the key in a div with our own id
          row.key.html = `<div id="${id}">${key}</div>`

          // Store the row name so it can be used in a summary at 
          // the top of the page
          invalidAnswers.push({name: key, id})
          
          // Error message that gets shown
          let messageContent = `${key} is not recognised`
          let messageHtml = `<p class="govuk-body app-summary-list__message--invalid govuk-!-margin-bottom-2">${messageContent}</p>`

          // Grab the existing action link and craft a new link
          let linkHtml = '' // default to no link
          let actionItems = row?.actions?.items

          // If there’s more than one link (unlikely), do nothing
          if (actionItems && actionItems.length == 1){
            let href = row?.actions?.items[0].href
            linkHtml = `<br><a class="govuk-link govuk-link--no-visited-state" href="${href}">
            Review the trainee’s answer<span class="govuk-visually-hidden"> for ${key.toLowerCase()}</span>
            </a>`
            delete row.actions.items
          }
        
          // Add a class to the row so we can target it
          row.classes = `${row.classes} app-summary-list__row--invalid`

          // Wrap in a div for styling
          let userValueHtml = `<div class="app-summary-list__user-value">${userValue}</div>`

          // Entire thing is wrapped in a div so we can style a left border within the padding of the
          // summary list value box
          row.value.html = `<div class="app-summary-list__value-inset">${messageHtml}${userValueHtml}${linkHtml}</div>`

          // Key will get saved to key.html, so we don’t need  key.text any more
          delete row.key?.text

        }

        else row.value.html = userValue

        // Source value might have been stored in text - delete just in case
        delete row.value?.text



      }
      return row
    })
  }

  // Unique our invalid answers just in case
  invalidAnswers = [...new Set(invalidAnswers)] 

  // Save array back to context
  // using lodash on the rare chance record doesn’t acutally exist yet
  if (invalidAnswers.length){
    _.set(this.ctx, 'data.record.invalidAnswers', invalidAnswers)
  }
  return rows
}

exports.captureInvalid = function(data){
  let ctx = Object.assign({}, this.ctx)

  delete this.ctx.data?.temp?.invalidString // just in case

  if (data.value && data.value.includes("**invalid**")){
    // data.value = data.value.replace("**invalid**", "")
    _.set(this.ctx, 'data.temp.invalidString', data.value)
    // data.value = data.value.replace("**invalid**", "")
    data.value = '' // wipe the value
  }
  return data
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

// Referrer could be an array of urls. If so, return the last one
// and put the remaining as the next referrer.
// This lets us support multiple return destinations
exports.getReferrerDestination = referrer => {
  if (typeof referrer == 'string'){
    referrer = referrer.split(",")
  }
  if (!referrer) return ''
  else if (Array.isArray(referrer)){
    let last = referrer.pop()
    if (referrer.length) return `${last}?referrer=${referrer}`
    else return last
  }
  else return referrer
}

// Return first part of url to use in redirects
exports.getRecordPath = req => {
  let recordType = req.params.recordtype
  return (recordType == 'record') ? (`/record/${req.params.uuid}`) : '/new-record'
}
