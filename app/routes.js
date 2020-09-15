const express = require('express')
const router = express.Router()
const faker = require('faker')
const path = require('path')
const _ = require('lodash')

// Return first part of url to use in redirects
const getRecordPath = req => {
  let recordType = req.params.recordtype
  return (recordType == 'record') ? ('/record/' + req.params.uuid) : '/new-record'
}

// Delete temporary stores of data
const deleteTempData = (data) => {
  delete data.degreeTemp
  delete data.record
}

// Append referrer to string if it exists
const getReferrer = referrer => {
  if (referrer && referrer != 'undefined'){
    return `?referrer=${referrer}`
  }
  else return '' 
}

// Check if all sections are complete
const recordIsComplete = record => {
  if (!record) return false
  let regularSections = [
    'personalDetails',
    'contactDetails',
    'diversity',
    'assessmentDetails',
    // 'qualifications.gceStatus', // A levels not implimented yet
    'gcse',
    'degree'
  ]

  let recordIsComplete = true

  regularSections.forEach(section => {
    if (_.get(record, `${section}.status`) != "Completed"){
      recordIsComplete = false
    }
  })

  return recordIsComplete
}

// Update or create a record
const updateRecord = (data, newRecord) => {

  if (!newRecord) return false
  
  let records = data.records
  newRecord.lastUpdated = new Date()
  
  if (!newRecord.id){
    newRecord.id = faker.random.uuid()
    records.push(newRecord)
  }
  else {
    let recordIndex = records.findIndex(record => record.id == newRecord.id)
    records[recordIndex] = newRecord
  }
  return true
}

// Pass referrer and query to page
router.all('*', function(req, res, next){
  const referrer = req.query.referrer
  res.locals.referrer = referrer
  res.locals.query = req.query
  next()
})

// =============================================================================
// Edit routes - add / edit record data
// =============================================================================

// Match against 'new-record' and 'uuid record' paths and work for both.

// Diversity branching
router.post(['/:recordtype/:uuid/diversity-disclosed','/:recordtype/diversity-disclosed'], function (req, res) {
  const data = req.session.data
  let diversityDisclosed = _.get(data, 'record.diversity.diversityDisclosed')
  let referrer = getReferrer(req.query.referrer)
  let recordPath = getRecordPath(req)
  // No data, return to page
  if (!diversityDisclosed){
    res.redirect(`${recordPath}/diversity-disclosed${referrer}`)
  }
  else if (diversityDisclosed == true || diversityDisclosed == "true"){
    res.redirect(`${recordPath}/ethnic-group${referrer}`)
  }
  else {
    res.redirect(`${recordPath}/diversity/confirm${referrer}`)
  }
})

// Ethnic group branching
router.post(['/:recordtype/:uuid/ethnic-group','/:recordtype/ethnic-group'], function (req, res) {
  let data = req.session.data
  let ethnicGroup = _.get(data, 'record.diversity.ethnicGroup')
  let recordPath = getRecordPath(req)
  let referrer = getReferrer(req.query.referrer)
  // No data, return to page
  if (!ethnicGroup){
    res.redirect(`${recordPath}/ethnic-group${referrer}`)
  }
  else if (ethnicGroup.includes("Not provided")){
    res.redirect(`${recordPath}/disabilities${referrer}`)
  }
  else {
    res.redirect(`${recordPath}/ethnic-background${referrer}`)
  }
})

// Disabilities branching
router.post(['/:recordtype/:uuid/disabilities','/:recordtype/disabilities'], function (req, res) {
  let data = req.session.data
  let hasDisabilities = _.get(data, 'record.diversity.disabledAnswer')
  let recordPath = getRecordPath(req)
  let referrer = getReferrer(req.query.referrer)

  // No data, return to page
  if (!hasDisabilities){
    res.redirect(`${recordPath}/disabilities${referrer}`)
  }
  else if (hasDisabilities == "Yes"){
    res.redirect(`${recordPath}/candidate-disabilities${referrer}`)
  }
  else {
    res.redirect(`${recordPath}/diversity/confirm${referrer}`)
  }
})

// Add a degree - sends you to index one greater than current number of degrees
router.get(['/:recordtype/:uuid/degree/add','/:recordtype/degree/add'], function (req, res) {
  const data = req.session.data
  let degrees = _.get(data, "record.degree.items")
  console.log('degrees is', degrees)
  let degreeCount = (degrees) ? degrees.length : 0
  console.log('degree count', degreeCount)
  let recordPath = getRecordPath(req)
  let referrer = getReferrer(req.query.referrer)
  res.redirect(`${recordPath}/degree/${degreeCount}/type${referrer}`)
})

// Delete degree at index
router.get(['/:recordtype/:uuid/degree/:index/delete','/:recordtype/degree/:index/delete'], function (req, res) {
  const data = req.session.data
  let recordPath = getRecordPath(req)
  degreeIndex = req.params.index
  let referrer = getReferrer(req.query.referrer)

  if (_.get(data, "record.degree.items[" + degreeIndex + "]")){
    _.pullAt(data.record.degree.items, [degreeIndex]) //delete item at index
    // Clear data if there are no more degrees - so the task list thinks the section is not started
    if (data.record.degree.items.length == 0){
      delete data.record.degree.items
    }
  }
  if (referrer){
    res.redirect(req.query.referrer)
  }
  else {
    res.redirect(`${recordPath}/degree/confirm${referrer}`)
  }
})

// Forward degree requests to the right template, including the index
router.get(['/:recordtype/:uuid/degree/:index/:page','/:recordtype/degree/:index/:page'], function (req, res) {
  let recordPath = getRecordPath(req)
  let referrer = getReferrer(req.query.referrer)

  res.render(`${req.params.recordtype}/degree/${req.params.page}`, {itemIndex: req.params.index})
})

// Save degree data from temporary store
router.post(['/:recordtype/:uuid/degree/:index/confirm','/:recordtype/degree/:index/confirm'], function (req, res) {
  const data = req.session.data
  let newDegree = data.degreeTemp
  delete data.degreeTemp
  let referrer = getReferrer(req.query.referrer)

  // Save the correct type
  if (newDegree.isInternational == "true" && newDegree.typeInt){
    newDegree.type = newDegree.typeInt
    delete newDegree.typeUK
    delete newDegree.typeInt
  }
  if (newDegree.isInternational == "false" && newDegree.typeUK){
    newDegree.type = newDegree.typeUK
    delete newDegree.typeUK
    delete newDegree.typeInt
  }

  // Combine radio and text inputs
  if (newDegree.baseGrade){
    if (newDegree.baseGrade == "Other"){
      newDegree.grade = newDegree.otherGrade
      delete newDegree.baseGrade
      delete newDegree.otherGrade
    }
    else {
      newDegree.grade = newDegree.baseGrade
      delete newDegree.baseGrade
      delete newDegree.otherGrade
    }
  }

  let existingDegrees = _.get(data, "record.degree.items")
  let degreeIndex = req.params.index
  let recordPath = getRecordPath(req)

  if (existingDegrees && existingDegrees[degreeIndex]) {
    // Might be a partial update, so merge the new with the old
    existingDegrees[degreeIndex] = Object.assign({}, existingDegrees[degreeIndex], newDegree)
  }
  else {
    existingDegrees = (!existingDegrees) ? [] : existingDegrees
    existingDegrees.push(newDegree)
  }

  _.set(data, 'record.degree.items', existingDegrees)

  res.redirect(`${recordPath}/degree/confirm${referrer}`)
})

// Diversity branching
router.post(['/:recordtype/:uuid/assessment-details','/:recordtype/assessment-details'], function (req, res) {
  const data = req.session.data
  let record = data.record
  let referrer = getReferrer(req.query.referrer)

  let assessmentDetails = _.get(data, 'record.assessmentDetails')
  let recordPath = getRecordPath(req)
  // No data, return to page
  if (!assessmentDetails){
    res.redirect(`${recordPath}/assessment-details`)
  }
  
  // Merge autocomplete and radio answers
  if (assessmentDetails.ageRange == 'Other age range'){
    assessmentDetails.ageRange = assessmentDetails.ageRangeOther
    delete assessmentDetails.ageRangeOther
  }

  record.assessmentDetails = assessmentDetails

  res.redirect(`${recordPath}/assessment-details/confirm${referrer}`)
})


// =============================================================================
// New records
// =============================================================================

// Delete data when starting new
router.get(['/new-record/new', '/new-record'], function (req, res) {
  const data = req.session.data
  deleteTempData(data)
  _.set(data, 'record', { status: 'Draft' })
  res.redirect('/new-record/record-setup')
})

// Show error if route is not assessment only
router.post('/new-record/record-setup', function (req, res) {
  const data = req.session.data
  let recordType = _.get(data, 'record.route') // Assessment only or not
  let referrer = getReferrer(req.query.referrer)

  // No data, return to page
  if (!recordType){
    res.redirect(`/new-record/record-setup${referrer}`)
  }
  else if (recordType === "Assessment only"){
    if (referrer){
      res.redirect(req.query.referrer)
    }
    else {
      res.redirect(`/new-record/overview`)
    }  
  }
  else {
    res.redirect(`/new-record/route-not-supported${referrer}`)
  }
})

// Task list confirmation page - pass errors to page
// Todo: use flash messages or something to pass real errors in
router.get('/new-record/check-record', function (req, res) {
  const data = req.session.data
  let errors = req.query.errors
  let errorList = false
  if (errors){
    errorList = true
  }
  res.render('new-record/check-record', {errorList})
})

// Save a record and put in data store
router.get('/new-record/save-as-draft', (req, res) => {
  const data = req.session.data
  // const records = data.records
  let newRecord = data.record
  // No data, return to page
  if (!newRecord){
    res.redirect('/new-record/overview')
  }
  else {
    newRecord.status = "Draft" // just in case
    updateRecord(data, newRecord)
    deleteTempData(data)
    res.redirect('/records')
  }
})

// Submit for TRN
router.post('/new-record/save', (req, res) => {
  const data = req.session.data
  let newRecord = _.get(data, 'record') // copy record

  if (!recordIsComplete(newRecord)){
    console.log('Record is incomplete, returning to check record')
    res.redirect('/new-record/check-record?errors=true')
  }
  else {
    newRecord.status = "Pending TRN"
    newRecord.submittedDate = new Date()
    updateRecord(data, newRecord)
    deleteTempData(data)
    req.session.data.recordId = newRecord.id //temp store for id to link to the record
    res.redirect('/new-record/submitted')
  }
})



// =============================================================================
// Existing records
// =============================================================================

// Set up data when viewing a record
router.get('/record/:uuid', function (req, res) {
  const data = req.session.data

  deleteTempData(data)
  const records = req.session.data.records
  const record = records.find(record => record.id == req.params.uuid)
  if (!record){
    res.redirect('/records')
  }
  // Save record to session to be used by views
  req.session.data.record = record

  // Redirect to task list journey if still a draft
  if (record.status == 'Draft'){
    res.redirect('/new-record/overview')
  }
  // Only submitted records
  else {
    res.locals.record = record
    res.render('record')
  }
})

// Copy qts data back to real record
router.post('/record/:uuid/qts/qts-recommended', (req, res) => {
  const data = req.session.data
  const newRecord = data.record
  // Update failed or no data
  if (!newRecord){
    res.redirect('/record/:uuid')
  }
  else {
    newRecord.status = 'Pending QTS'
    newRecord.recommendedDate = new Date()
    updateRecord(data, newRecord)
    deleteTempData(data)
    res.redirect('/record/' + req.params.uuid)
  }
})

// Copy temp record back to real record
router.post('/record/:uuid/:page/update', (req, res) => {
  const data = req.session.data
  const newRecord = data.record
  // Update failed or no data
  if (!newRecord){
    res.redirect('/record/:uuid')
  }
  else {
    updateRecord(data, newRecord)
    deleteTempData(data)
    res.redirect('/record/' + req.params.uuid)
  }
})









// Existing record pages
router.get('/record/:uuid/:page*', function (req, res) {
  let records = req.session.data.records
  const referrer = req.query.referrer
  res.locals.referrer = referrer
  const record = records.find(record => record.id == req.params.uuid)
  if (!record){
    res.redirect('/records')
  }
  else {
    res.render(path.join('record', req.params.page, req.params[0]))
  }
})

// Filters
router.get('/records', function (req, res) {
  const data = req.session.data
  let filterStatus = data.filterStatus
  if (!filterStatus) {
    filterStatus = []
  }
  let records = data.records
  let filteredRecords = []
  if (filterStatus.length) {
    filteredRecords = records.filter(record => {
      let statusMatch = filterStatus.includes(record.status)
      return statusMatch
    })
  } else {
    filteredRecords = records
  }
  res.render('records', {filteredRecords})
})


module.exports = router
