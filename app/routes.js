const express = require('express')
const router = express.Router()
const faker = require('faker')
const path = require('path')
const _ = require('lodash')

const getRecordPath = req => {
  let recordType = req.params.recordtype
  return (recordType == 'record') ? ('/record/' + req.params.uuid) : '/new-record'
}

router.get('/record/:uuid', function (req, res) {
  let records = req.session.data.records
  const record = records.find(record => record.id == req.params.uuid)

  // Save record to session to be used by views
  req.session.data.record = record
  res.locals.record = record
  if (!record){
    res.redirect('/records')
  }
  else {
    res.render('record')
  }
})

router.get('/record/:uuid/:page*', function (req, res) {
  let records = req.session.data.records
  const record = records.find(record => record.id == req.params.uuid)
  console.log(req.params.uuid)
  if (!record){
    res.redirect('/records')
  }
  else {
    res.render(path.join('record', req.params.page, req.params[0]))
  }
})

router.post('/record/:uuid/:page/update', (req, res) => {
  const data = req.session.data
  let newRecord = data.record
  if (!newRecord){
    res.redirect('/record/:uuid')
  }
  else {
    delete data.record
    const records = data.records
    const recordIndex = records.findIndex(record => record.id == req.params.uuid)
    records[recordIndex] = newRecord
    res.redirect('/record/' + req.params.uuid)
  }

})

// Delete data when starting new
router.get(['/new-record/new', '/new-record'], function (req, res) {
  const data = req.session.data
  delete data.record
  res.redirect('/new-record/overview')
})

// Delete data when starting new
router.post(['/:recordtype/:uuid/diversity-disclosed','/:recordtype/diversity-disclosed'], function (req, res) {
  let data = req.session.data
  let diversityDisclosed = _.get(data, 'record.diversity.diversityDisclosed')
  let recordPath = getRecordPath(req)
  if (!diversityDisclosed){
    res.redirect(recordPath + '/diversity-disclosed')
  }
  else if (diversityDisclosed == true || diversityDisclosed == "true"){
    res.redirect(recordPath + '/ethnic-group')
  }
  else {
    res.redirect(recordPath + '/diversity/confirm')
  }
})

router.post(['/:recordtype/:uuid/ethnic-group','/:recordtype/ethnic-group'], function (req, res) {
  let data = req.session.data
  let ethnicGroup = _.get(data, 'record.diversity.ethnicGroup')
  let recordPath = getRecordPath(req)
  if (!ethnicGroup){
    res.redirect(recordPath + '/ethnic-group')
  }
  else if (ethnicGroup.includes("Not provided")){
    res.redirect(recordPath + '/disabilities')
  }
  else {
    res.redirect(recordPath + '/ethnic-background')
  }
})

router.post(['/:recordtype/:uuid/disabilities','/:recordtype/disabilities'], function (req, res) {
  let data = req.session.data
  let hasDisabilities = _.get(data, 'record.diversity.disabledAnswer')
  let recordPath = getRecordPath(req)
  if (!hasDisabilities){
    res.redirect(recordPath + '/disabilities')
  }
  else if (hasDisabilities == "Yes"){
    res.redirect(recordPath + '/candidate-disabilities')
  }
  else {
    res.redirect(recordPath + '/diversity/confirm')
  }
})

router.post('/new-record/save', (req, res) => {
  const data = req.session.data
  let record = data.record
  if (!record){
    res.redirect('/new-record/overview')
  }
  else {
    delete data.record
    record.id = faker.random.uuid()
    record.status = "Incomplete"
    record.submittedDate = new Date()
    res.locals.record = record
    req.session.data.recordId = record.id
    data.records.push(record)
    res.redirect('/new-record/submitted')
  }

})


module.exports = router
