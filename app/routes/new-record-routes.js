const faker = require('faker')
const path = require('path')
const moment = require('moment')
const filters = require('./../filters.js')()
const _ = require('lodash')
const utils = require('./route-utils')


module.exports = router => {

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


}
