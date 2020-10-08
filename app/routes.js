const express = require('express')
const router = express.Router()
const faker = require('faker')
const path = require('path')
const moment = require('moment')
const filters = require('./filters.js')()
const _ = require('lodash')
const utils = require('./routes/route-utils')

// Catch all to pass common data to views
// Needs to be before other routes
router.all('*', function(req, res, next){
  const referrer = req.query.referrer
  res.locals.referrer = referrer
  res.locals.query = req.query
  res.locals.flash = req.flash('success') // pass through 'success' messages only
  next()
})

// Records page with filters
require('./routes/records-page')(router)

// =============================================================================
// Edit routes - add / edit record data
// =============================================================================

// Match against 'new-record' and 'uuid record' paths and work for both.

// Diversity branching
router.post(['/:recordtype/:uuid/diversity-disclosed','/:recordtype/diversity-disclosed'], function (req, res) {
  const data = req.session.data
  let diversityDisclosed = _.get(data, 'record.diversity.diversityDisclosed')
  let referrer = utils.getReferrer(req.query.referrer)
  let recordPath = utils.getRecordPath(req)
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
  let recordPath = utils.getRecordPath(req)
  let referrer = utils.getReferrer(req.query.referrer)
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
  let recordPath = utils.getRecordPath(req)
  let referrer = utils.getReferrer(req.query.referrer)

  // No data, return to page
  if (!hasDisabilities){
    res.redirect(`${recordPath}/disabilities${referrer}`)
  }
  else if (hasDisabilities == "Yes"){
    res.redirect(`${recordPath}/trainee-disabilities${referrer}`)
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
  let recordPath = utils.getRecordPath(req)
  let referrer = utils.getReferrer(req.query.referrer)
  res.redirect(`${recordPath}/degree/${degreeCount}/type${referrer}`)
})

// Delete degree at index
router.get(['/:recordtype/:uuid/degree/:index/delete','/:recordtype/degree/:index/delete'], function (req, res) {
  const data = req.session.data
  let recordPath = utils.getRecordPath(req)
  degreeIndex = req.params.index
  let referrer = utils.getReferrer(req.query.referrer)

  if (_.get(data, "record.degree.items[" + degreeIndex + "]")){
    _.pullAt(data.record.degree.items, [degreeIndex]) //delete item at index
    // Clear data if there are no more degrees - so the task list thinks the section is not started
    req.flash('success', 'Trainee degree deleted')
    if (data.record.degree.items.length == 0){
      delete data.record.degree.items
    }
  }
  if (referrer){
    if (req.params.recordtype == 'record'){
      // This updates the record immediately without a confirmation.
      // Probably needs a bespoke confirmation page as the empty degree
      // confirmation page looks weird - and we probably don't want
      // records without a dregree anyway.
      utils.updateRecord(data, data.record)
    }
    res.redirect(req.query.referrer)
  }
  else {
    res.redirect(`${recordPath}/degree/confirm${referrer}`)
  }
})

// Forward degree requests to the right template, including the index
router.get(['/:recordtype/:uuid/degree/:index/:page','/:recordtype/degree/:index/:page'], function (req, res) {
  let recordPath = utils.getRecordPath(req)
  let referrer = utils.getReferrer(req.query.referrer)

  res.render(`${req.params.recordtype}/degree/${req.params.page}`, {itemIndex: req.params.index})
})

// Save degree data from temporary store
router.post(['/:recordtype/:uuid/degree/:index/confirm','/:recordtype/degree/:index/confirm'], function (req, res) {
  const data = req.session.data
  let newDegree = data.degreeTemp
  delete data.degreeTemp
  let referrer = utils.getReferrer(req.query.referrer)

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
    if (newDegree.baseGrade == "Grade known"){
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
  let recordPath = utils.getRecordPath(req)

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
router.post(['/:recordtype/:uuid/programme-details','/:recordtype/programme-details'], function (req, res) {
  const data = req.session.data
  let record = data.record
  let referrer = utils.getReferrer(req.query.referrer)

  let programmeDetails = _.get(data, 'record.programmeDetails')
  let recordPath = utils.getRecordPath(req)
  // No data, return to page
  if (!programmeDetails){
    res.redirect(`${recordPath}/programme-details`)
  }
  
  // Merge autocomplete and radio answers
  if (programmeDetails.ageRange == 'Other age range'){
    programmeDetails.ageRange = programmeDetails.ageRangeOther
    delete programmeDetails.ageRangeOther
  }

  record.programmeDetails = programmeDetails

  res.redirect(`${recordPath}/programme-details/confirm${referrer}`)
})


// =============================================================================
// New records
// =============================================================================

// Delete data when starting new
router.get(['/new-record/new', '/new-record'], function (req, res) {
  const data = req.session.data
  utils.deleteTempData(data)
  _.set(data, 'record', { status: 'Draft' })
  _.set(data, 'record.events.items', [])
  res.redirect('/new-record/record-setup')
})

// Show error if route is not assessment only
router.post('/new-record/record-setup', function (req, res) {
  const data = req.session.data
  let recordType = _.get(data, 'record.route') // Assessment only or not
  let referrer = utils.getReferrer(req.query.referrer)

  // No data, return to page
  if (!recordType){
    res.redirect(`/new-record/record-setup${referrer}`)
  }
  else if (recordType === "Assessment Only"){
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
  let newRecord = _.get(data, 'record') // copy record
  let isComplete = utils.recordIsComplete(newRecord)
  let errorList = false
  if (errors){
    errorList = true
  }
  res.render('new-record/check-record', {errorList, recordIsComplete: isComplete})
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
    utils.deleteTempData(data)
    utils.updateRecord(data, newRecord)
    req.flash('success', 'Record saved as draft')
    res.redirect('/records')
  }
})

// Submit for TRN
router.post('/new-record/save', (req, res) => {
  const data = req.session.data
  let newRecord = _.get(data, 'record') // copy record

  if (!utils.recordIsComplete(newRecord)){
    console.log('Record is incomplete, returning to check record')
    res.redirect('/new-record/check-record?errors=true')
  }
  else {
    newRecord.status = "Pending TRN"
    newRecord.submittedDate = new Date()
    utils.deleteTempData(data)
    utils.updateRecord(data, newRecord, "Trainee submitted for TRN")
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

  utils.deleteTempData(data)
  const records = req.session.data.records
  const record = records.find(record => record.id == req.params.uuid)
  if (!record){
    res.redirect('/records')
  }
  // Save record to session to be used by views
  req.session.data.record = record

  // Redirect to task list journey if still a draft
  if (record.status == 'Draft'){
    // req.flash('success', 'Restoring saved draft')
    res.redirect('/new-record/overview')
  }
  // Only submitted records
  else {
    res.locals.record = record
    res.render('record')
  }
})

// Manually advance an application from pending to trn received
router.get('/record/:uuid/trn', (req, res) => {
  const data = req.session.data
  const newRecord = data.record
  // Update failed or no data
  if (!newRecord){
    res.redirect('/record/:uuid')
  }
  else {
    if (newRecord.status == 'Pending TRN'){
      newRecord.status = 'TRN received'
      newRecord.trn = faker.random.number({
        'min': 1000000,
        'max': 9999999
      })
      utils.deleteTempData(data)
      utils.updateRecord(data, newRecord, "TRN received")
    }
    res.redirect(`/record/${req.params.uuid}`)
  }
})

// Manually advance an application from Pending QTS to QTS awarded
router.get('/record/:uuid/qts', (req, res) => {
  const data = req.session.data
  const newRecord = data.record
  // Update failed or no data
  if (!newRecord){
    res.redirect('/record/:uuid')
  }
  else {
    if (newRecord.status == 'QTS recommended' || newRecord.status == 'TRN received'){
      newRecord.status = 'QTS awarded'
      _.set(newRecord, 'programmeDetails.endDate', (new Date()))
      _.set(newRecord, 'qtsDetails.qtsDetails.standardsAssessedOutcome', "Passed")
      utils.deleteTempData(data)
      utils.addEvent(newRecord, "Trainee recommended for QTS")
      utils.updateRecord(data, newRecord, "QTS awarded")
    }
    res.redirect(`/record/${req.params.uuid}`)
  }
})

// Get timeline items and pass to view
router.get('/record/:uuid/timeline', (req, res) => {
  const data = req.session.data
  const record = data.record
  if (!record){
    res.redirect('/record/:uuid')
  }
  let timeline = utils.getTimeline(record)
  res.render(`record/timeline`, {timeline})
})

// Copy qts data back to real record
router.post('/record/:uuid/qts/outcome', (req, res) => {
  const data = req.session.data
  if (_.get(data, "record.qtsDetails.standardsAssessedOutcome") == 'Not passed'){
    res.redirect(`/record/${req.params.uuid}/qts/assessment-not-passed`)
  }
  else {
    res.redirect(`/record/${req.params.uuid}/qts/confirm`)
  }
})

// Copy qts data back to real record
router.post('/record/:uuid/qts/confirm', (req, res) => {
  const data = req.session.data
  const newRecord = data.record
  // Update failed or no data
  if (!newRecord){
    res.redirect('/record/:uuid')
  }
  else {
    newRecord.status = 'QTS recommended'
    newRecord.qtsRecommendedDate = new Date()
    utils.deleteTempData(data)
    utils.updateRecord(data, newRecord, "Trainee recommended for QTS")
    // req.flash('success', 'Trainee recommended for QTS')
    res.redirect(`/record/${req.params.uuid}/qts/recommended`)
  }
})

// Copy defer data back to real record
router.post('/record/:uuid/defer/confirm', (req, res) => {
  const data = req.session.data
  const newRecord = data.record

  // Update failed or no data
  if (!newRecord){
    res.redirect('/record/:uuid')
  }
  else {
    newRecord.previousStatus = newRecord.status
    newRecord.status = 'Deferred'
    delete newRecord.deferredDateRadio
    utils.deleteTempData(data)
    utils.updateRecord(data, newRecord, "Trainee deferred")
    req.flash('success', 'Trainee deferred')
    res.redirect(`/record/${req.params.uuid}`)
  }
})

// Get dates for Defer flow
router.post('/record/:uuid/defer', (req, res) => {
  const data = req.session.data
  const newRecord = data.record

  // Update failed or no data
  if (!newRecord){
    res.redirect('/record/:uuid')
  }
  else {
    let radioChoice = newRecord.deferredDateRadio
    if (radioChoice == "Today") {
      newRecord.deferredDate = filters.toDateArray(filters.today())
    } 
    if (radioChoice == "Yesterday") {
      newRecord.deferredDate = filters.toDateArray(moment().subtract(1, "days"))
    } 
    res.redirect(`/record/${req.params.uuid}/defer/confirm`)
  }
})

// Copy reinstate data back to real record
router.post('/record/:uuid/reinstate/confirm', (req, res) => {
  const data = req.session.data
  const newRecord = data.record
  // Update failed or no data
  if (!newRecord){
    res.redirect('/record/:uuid')
  }
  else {
    newRecord.status = newRecord.previousStatus || 'TRN received'
    delete newRecord.previousStatus
    utils.deleteTempData(data)
    utils.updateRecord(data, newRecord, "Trainee reinstated")
    req.flash('success', 'Trainee reinstated')
    res.redirect(`/record/${req.params.uuid}`)
  }
})

// Get dates for reinstate flow
router.post('/record/:uuid/reinstate', (req, res) => {
  const data = req.session.data
  const newRecord = data.record

  // Update failed or no data
  if (!newRecord){
    res.redirect(`/record/${req.params.uuid}`)
  }
  else {
    let radioChoice = newRecord.reinstateDateRadio
    if (radioChoice == "Today") {
      newRecord.reinstateDate = filters.toDateArray(filters.today())
    }
    if (radioChoice == "Yesterday") {
      newRecord.reinstateDate = filters.toDateArray(moment().subtract(1, "days"))
    } 
    res.redirect(`/record/${req.params.uuid}/reinstate/confirm`)
  }
})

// Copy withdraw data back to real record
router.post('/record/:uuid/withdraw/confirm', (req, res) => {
  const data = req.session.data
  const newRecord = data.record

  // Update failed or no data
  if (!newRecord){
    res.redirect('/record/:uuid')
  }
  else {
    newRecord.previousStatus = newRecord.status
    newRecord.status = 'Withdrawn'
    delete newRecord.withdrawDateRadio
    if (newRecord.withdrawalReason != "For another reason") {
      delete newRecord.withdrawalReasonOther
    }
    utils.deleteTempData(data)
    utils.updateRecord(data, newRecord, "Trainee withdrawn")
    req.flash('success', 'Trainee withdrawn')
    res.redirect('/record/' + req.params.uuid)
  }
})

// Get dates for withdraw flow
router.post('/record/:uuid/withdraw', (req, res) => {
  const data = req.session.data
  const newRecord = data.record

  // Update failed or no data
  if (!newRecord){
    res.redirect('/record/:uuid')
  }
  else {
    let radioChoice = newRecord.withdrawalDateRadio
    if (radioChoice == "Today") {
      newRecord.withdrawalDate = filters.toDateArray(filters.today())
    } 
    if (radioChoice == "Yesterday") {
      newRecord.withdrawalDate = filters.toDateArray(moment().subtract(1, "days"))
    } 
    res.redirect('/record/' + req.params.uuid + '/withdraw/confirm')
  }
})

// Copy temp record back to real record
router.post(['/record/:uuid/:page/update', '/record/:uuid/update'], (req, res) => {
  const data = req.session.data
  const newRecord = data.record
  // Update failed or no data
  if (!newRecord){
    res.redirect('/record/:uuid')
  }
  else {
    utils.deleteTempData(data)
    utils.updateRecord(data, newRecord)
    req.flash('success', 'Trainee record updated')

    if (req.params.page && req.params.page != 'programme-details' && req.params.page != 'trainee-id'){
      res.redirect(`/record/${req.params.uuid}/details-and-education`)
    }
    else {
      res.redirect(`/record/${req.params.uuid}`)
    }
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




module.exports = router
