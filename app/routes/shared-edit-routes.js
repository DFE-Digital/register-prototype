const faker = require('faker')
const path = require('path')
const moment = require('moment')
const recordUtils = require('./../lib/record.js')
const _ = require('lodash')
const utils = require('./route-utils')


module.exports = router => {

  // =============================================================================
  // Training details
  // =============================================================================

  // Clear commencement date if trainee hasn’t started
  router.post(['/:recordtype/:uuid/training-details','/:recordtype/training-details'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let traineeStarted = _.get(record, 'trainingDetails.traineeStarted')
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    if (traineeStarted == "false"){
      delete record.trainingDetails.commencementDate
    }   
    res.redirect(`${recordPath}/training-details/confirm${referrer}`)

  })

  // =============================================================================
  // Programme details
  // =============================================================================

  // Show pick-course or pick-route depending on if current provider has courses
  // on Publish
  router.get(['/:recordtype/:uuid/programme-details','/:recordtype/programme-details'], function (req, res) {
    const data = req.session.data
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let providerCourses = data.courses["University of Southampton"].courses
    // Filter routes we're not yet supporting
    let filteredCourses = providerCourses.filter(course => {
      return data.settings.enabledTrainingRoutes.includes(course.route)
    })
    let limitedCourses = filteredCourses.splice(0, data.settings.courseLimit)

    if (limitedCourses.length) {
      res.redirect(`${recordPath}/programme-details/pick-course${referrer}`)
    }
    else {
      res.redirect(`${recordPath}/programme-details/pick-route${referrer}`)
    }
  })

  // Picking a course
  router.post(['/:recordtype/:uuid/programme-details/pick-course','/:recordtype/programme-details/pick-course'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let enabledRoutes = data.settings.enabledTrainingRoutes
    // Todo: make this selection of providers dynamic
    let providerCourses = data.courses["University of Southampton"].courses
    let selectedCourse = _.get(data, 'record.selectedCourseTemp')

    // No data, return to page
    if (!selectedCourse){
      res.redirect(`${recordPath}/programme-details/pick-course${referrer}`)
    }
    else if (selectedCourse == "Other"){
      if (_.get(record, 'programmeDetails.isPublishCourse')){
        // User has swapped from a publish to a non-publish course. Delete existing data
        delete record.programmeDetails
        delete record.route
      }
      res.redirect(`${recordPath}/programme-details/pick-route${referrer}`)
    }

    else {
      // selectedCourse could be an id of a course or a radio that contains an autocomplete
      if (selectedCourse == "publish-course") {
        selectedCourse = _.get(data, 'record.selectedCourseAutocompleteTemp')
      }
      // Assume everything else is a course id
      courseIndex = providerCourses.findIndex(course => course.id == selectedCourse)
      if (courseIndex < 0){
        // Nothing found for current provider (something has gone wrong)
        console.log(`Provider course ${selectedCourse} not recognised`)
        res.redirect(`${recordPath}/programme-details/pick-course${referrer}`)
      }
      else {
        // Copy over that provider's course data
        record.programmeDetails = providerCourses[courseIndex]
        res.redirect(`${recordPath}/programme-details/confirm-publish-details${referrer}`)
      }
    }
  })

  // Confirm that the pubish course is correct. This is shown instead of the regular /confirm
  // page when selecting a publish course. The regular /confirm page is still shown when 
  // reviewing from a summary page, or after editing other details.
  // This route is needed because we need to conditionally pass on to /allocated-place if
  // the route and subject match certain conditions.
  router.post(['/:recordtype/:uuid/programme-details/confirm-publish-details','/:recordtype/programme-details/confirm-publish-details'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let referrer = utils.getReferrer(req.query.referrer)
    let recordPath = utils.getRecordPath(req)
    // Copy route up to higher level
    record.route = record.programmeDetails.route
    delete record.selectedCourseTemp
    delete record.selectedCourseAutocompleteTemp

    let isAllocated = recordUtils.hasAllocatedPlaces(record)
    isAllocated = true
    if (isAllocated) {
      // After /allocated-place the journey will match other programme-details routes
      res.redirect(`${recordPath}/programme-details/allocated-place${referrer}`)
    }
    else {
      if (req.params.recordtype == 'record'){
        // This is basically the same as the /update route
        utils.updateRecord(data, record)
        utils.deleteTempData(data)
        req.flash('success', 'Trainee record updated')
        // Referrer or non-referrer probably goes to the same place
        if (referrer){
          res.redirect(req.query.referrer)
        }
        else {
          res.redirect(`${recordPath}`)
        }
      }
      else {
        // Implicitly confirm the section by confirming it
        record.programmeDetails.status = "Completed"
        if (referrer){
          // Return to check-record page
          res.redirect(req.query.referrer)
        }
        else {
          res.redirect(`${recordPath}/overview`)
        }
      }

    }
  })

  // Picking a course
  router.post(['/:recordtype/:uuid/programme-details/pick-route','/:recordtype/programme-details/pick-route'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let enabledRoutes = data.settings.enabledTrainingRoutes
    let selectedRoute = _.get(data, 'record.route')

    // No data, return to page
    if (!selectedRoute){
      res.redirect(`${recordPath}/programme-details/pick-route${referrer}`)
    }
    else if (selectedRoute == "Other"){
      res.redirect(`/new-record/programme-details/route-not-supported${referrer}`)
    }
    else {
      res.redirect(`${recordPath}/programme-details/details${referrer}`)
    }
  })


  router.post(['/:recordtype/:uuid/programme-details/details','/:recordtype/programme-details/details'], function (req, res) {
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

    let isAllocated = recordUtils.hasAllocatedPlaces(record)

    if (isAllocated) {
      res.redirect(`${recordPath}/programme-details/allocated-place${referrer}`)
    }
    else {
      res.redirect(`${recordPath}/programme-details/confirm${referrer}`)
    }

  })

  // =============================================================================
  // Diversity section
  // =============================================================================

  // Diversity branching
  router.post(['/:recordtype/:uuid/diversity/information-disclosed','/:recordtype/diversity/information-disclosed'], function (req, res) {
    const data = req.session.data
    let diversityDisclosed = _.get(data, 'record.diversity.diversityDisclosed')
    let referrer = utils.getReferrer(req.query.referrer)
    let recordPath = utils.getRecordPath(req)
    // No data, return to page
    if (!diversityDisclosed){
      res.redirect(`${recordPath}/diversity/information-disclosed${referrer}`)
    }
    else if (diversityDisclosed == true || diversityDisclosed == "true"){
      res.redirect(`${recordPath}/diversity/ethnic-group${referrer}`)
    }
    else {
      res.redirect(`${recordPath}/diversity/confirm${referrer}`)
    }
  })

  // Ethnic group branching
  router.post(['/:recordtype/:uuid/diversity/ethnic-group','/:recordtype/diversity/ethnic-group'], function (req, res) {
    let data = req.session.data
    let ethnicGroup = _.get(data, 'record.diversity.ethnicGroup')
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    // No data, return to page
    if (!ethnicGroup){
      res.redirect(`${recordPath}/diversity/ethnic-group${referrer}`)
    }
    else if (ethnicGroup.includes("Not provided")){
      res.redirect(`${recordPath}/diversity/disabilities${referrer}`)
    }
    else {
      res.redirect(`${recordPath}/diversity/ethnic-background${referrer}`)
    }
  })

  // Disabilities branching
  router.post(['/:recordtype/:uuid/diversity/disabilities','/:recordtype/diversity/disabilities'], function (req, res) {
    let data = req.session.data
    let disabledAnswer = _.get(data, 'record.diversity.disabledAnswer')
    let hasDisabilities = (disabledAnswer == "They shared that they’re disabled") ? true : false
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    // No data, return to page
    if (!disabledAnswer){
      res.redirect(`${recordPath}/diversity/disabilities${referrer}`)
    }
    else if (hasDisabilities){
      res.redirect(`${recordPath}/diversity/trainee-disabilities${referrer}`)
    }
    else {
      res.redirect(`${recordPath}/diversity/confirm${referrer}`)
    }
  })

  // =============================================================================
  // Degrees
  // =============================================================================

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

}
