const express = require('express')
const router = express.Router()
const faker = require('faker')
const path = require('path')

// Add your routes here - above the module.exports line
// router.get('/record/:uuid*', function (req, res, next) {
//   let records = req.session.data.records
//   const record = records.find(record => record.id == req.params.uuid)
//   if (!record){
//     res.redirect('/records')
//   }
//   req.locals.record = record
//   next()
// })

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
    // if (record.status == "Submitted"){
    //   res.render(path.join('new-record', req.params.page, req.params[0]))
    // }
    // else {
      res.render(path.join('record', req.params.page, req.params[0]))
    // }
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

    res.redirect('/record/:uuid')
  }

})

// Delete data when starting new
router.get('/new-record/new', function (req, res) {
  const data = req.session.data
  delete data.record
  res.redirect('/new-record/overview')
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
    // record.submittedDate = "2020-07-30T21:40:41.308Z"

    data.records.push(record)
    res.redirect('/records')
  }

})


module.exports = router
