const express = require('express')
const router = express.Router()
const faker = require('faker')
const path = require('path')
const _ = require('lodash')

const getRecordPath = req => {
  let recordType = req.params.recordtype
  return (recordType == 'record') ? ('/record/' + req.params.uuid) : '/new-record'
}

// Set up data when viewing a record
router.get('/record/:uuid', function (req, res) {
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

// Existing record pages
router.get('/record/:uuid/:page*', function (req, res) {
  let records = req.session.data.records
  const record = records.find(record => record.id == req.params.uuid)
  if (!record){
    res.redirect('/records')
  }
  else {
    res.render(path.join('record', req.params.page, req.params[0]))
  }
})

// Copy temp record back to real record
router.post('/record/:uuid/:page/update', (req, res) => {
  const data = req.session.data
  const records = data.records
  const newRecord = data.record
  // Update failed or no data
  if (!newRecord){
    res.redirect('/record/:uuid')
  }
  else {
    // Delete temp data
    delete data.record
    const recordIndex = records.findIndex(record => record.id == req.params.uuid)
    // Overwrite record with temp record
    records[recordIndex] = newRecord
    res.redirect('/record/' + req.params.uuid)
  }
})

// Delete data when starting new
router.get(['/new-record/new', '/new-record'], function (req, res) {
  const data = req.session.data
  delete data.record
  data.record = { status: 'Draft' }
  res.redirect('/new-record/overview')
})

// Diversity branching
router.post(['/:recordtype/:uuid/diversity-disclosed','/:recordtype/diversity-disclosed'], function (req, res) {
  const data = req.session.data
  let diversityDisclosed = _.get(data, 'record.diversity.diversityDisclosed')
  let recordPath = getRecordPath(req)
  // No data, return to page
  if (!diversityDisclosed){
    res.redirect(`${recordPath}/diversity-disclosed`)
  }
  else if (diversityDisclosed == true || diversityDisclosed == "true"){
    res.redirect(`${recordPath}/ethnic-group`)
  }
  else {
    res.redirect(`${recordPath}/diversity/confirm`)
  }
})

// Ethnic group branching
router.post(['/:recordtype/:uuid/ethnic-group','/:recordtype/ethnic-group'], function (req, res) {
  let data = req.session.data
  let ethnicGroup = _.get(data, 'record.diversity.ethnicGroup')
  let recordPath = getRecordPath(req)
  // No data, return to page
  if (!ethnicGroup){
    res.redirect(`${recordPath}/ethnic-group`)
  }
  else if (ethnicGroup.includes("Not provided")){
    res.redirect(`${recordPath}/disabilities`)
  }
  else {
    res.redirect(`${recordPath}/ethnic-background`)
  }
})

// Disabilities branching
router.post(['/:recordtype/:uuid/disabilities','/:recordtype/disabilities'], function (req, res) {
  let data = req.session.data
  let hasDisabilities = _.get(data, 'record.diversity.disabledAnswer')
  let recordPath = getRecordPath(req)
  // No data, return to page
  if (!hasDisabilities){
    res.redirect(`${recordPath}/disabilities`)
  }
  else if (hasDisabilities == "Yes"){
    res.redirect(`${recordPath}/candidate-disabilities`)
  }
  else {
    res.redirect(`${recordPath}/diversity/confirm`)
  }
})

// Add a degree - sends you to index one greater than current number of degrees
router.get(['/:recordtype/:uuid/degree/add','/:recordtype/degree/add'], function (req, res) {
  const data = req.session.data
  let degrees = _.get(data, "record.qualifications.degree")
  let degreeCount = (degrees) ? degrees.length : 0
  let recordPath = getRecordPath(req)
  res.redirect(`${recordPath}/degree/${degreeCount}/type`)
})

// Delete degree at index
router.get(['/:recordtype/:uuid/degree/:index/delete','/:recordtype/degree/:index/delete'], function (req, res) {
  const data = req.session.data
  let recordPath = getRecordPath(req)
  degreeIndex = req.params.index
  if (_.get(data, "record.qualifications.degree[" + degreeIndex + "]")){
    _.pullAt(data.record.qualifications.degree, [degreeIndex]) //delete item at index
    // Clear data if there are no more degrees - so the task list thinks the section is not started
    if (data.record.qualifications.degree.length == 0){
      delete data.record.qualifications.degree
      delete data.record.qualifications.degreeStatus
    }
  }
  res.redirect(`${recordPath}/degree/confirm`)
})

// Forward degree requests to the right template, including the index
router.get(['/:recordtype/:uuid/degree/:index/:page','/:recordtype/degree/:index/:page'], function (req, res) {
  let recordPath = getRecordPath(req)
  // res.render(`${recordPath}/degree/${req.params.index}/${req.params.page}`, {itemIndex: req.params.index})
  res.render(`${req.params.recordtype}/degree/${req.params.page}`, {itemIndex: req.params.index})
})

// Save degree data from temporary store
router.post(['/:recordtype/:uuid/degree/:index/confirm','/:recordtype/degree/:index/confirm'], function (req, res) {
  const data = req.session.data
  let newDegree = data.degreeTemp
  delete data.degreeTemp
  let existingDegrees = _.get(data, "record.qualifications.degree")
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

  _.set(data, 'record.qualifications.degree', existingDegrees)

  res.redirect(`${recordPath}/degree/confirm`)
})

// Diversity branching
router.post(['/:recordtype/:uuid/assessment-details','/:recordtype/assessment-details'], function (req, res) {
  const data = req.session.data
  let record = data.record
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

  res.redirect(`${recordPath}/assessment-details/confirm`)
})

// Save a record and put in data store
router.get('/new-record/save-as-draft', (req, res) => {
  const data = req.session.data
  const records = data.records
  let record = data.record
  // No data, return to page
  if (!record){
    res.redirect('/new-record/overview')
  }
  else {
    delete data.record
    record.status = "Draft" // just in case
    record.lastUpdated = new Date()
    // Could be an existing draft
    if (record.id){
      const recordIndex = records.findIndex(record => record.id == req.params.uuid)
      records[recordIndex] = record
    }
    // Is a new draft
    else {
      record.id = faker.random.uuid()
      data.records.push(record)
    }
    res.redirect('/records')
  }

})

// Submit for TRN
router.post('/new-record/save', (req, res) => {
  let data = req.session.data
  let records = data.records
  let newRecord = _.get(data, 'record') // copy record
  // No data, return to page
  if (!newRecord){
    res.redirect('/new-record/overview')
  }
  else {
    newRecord.status = "Pending TRN"
    newRecord.lastUpdated = new Date()
    newRecord.submittedDate = new Date()
    // Existing draft
    if (newRecord.id){
      const recordIndex = records.findIndex(record => record.id == newRecord.id)
      records[recordIndex] = newRecord
    }
    // Is a new record
    else {
      newRecord.id = faker.random.uuid()
      data.records.push(newRecord)
    }
    delete data.record
    // res.locals.record = record
    req.session.data.recordId = newRecord.id //temp store for id to link to the record
    res.redirect('/new-record/submitted')
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
