const faker = require('faker')
const path = require('path')
const moment = require('moment')
const filters = require('./../filters.js')()
const _ = require('lodash')
const utils = require('./route-utils')


module.exports = router => {

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



}
