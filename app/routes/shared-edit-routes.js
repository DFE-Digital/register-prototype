const faker = require('faker')
const path = require('path')
const moment = require('moment')
const utils = require('./../lib/utils')
const _ = require('lodash')


module.exports = router => {

  // =============================================================================
  // Training details - details specific to this trainee
  // =============================================================================

  // Clear commencement date if trainee hasn’t started
  router.post(['/:recordtype/:uuid/training-details','/:recordtype/training-details'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    let traineeStarted = record?.trainingDetails?.traineeStarted

    if (traineeStarted == "false"){ // If the answer was explicitly false.
      delete record?.trainingDetails?.commencementDate
    }
    // Conditional pages
    if (utils.requiresField(record, 'leadSchool')){
      res.redirect(`${recordPath}/training-details/lead-school${referrer}`)
    }
    else if (utils.requiresField(record, 'employingSchool')){
      res.redirect(`${recordPath}/training-details/employing-school${referrer}`)
    }
    else {
      res.redirect(`${recordPath}/training-details/confirm${referrer}`)
    }
  })

  router.post(['/:recordtype/:uuid/training-details/lead-school','/:recordtype/training-details/lead-school'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    let schoolUuid = record?.trainingDetails?.leadSchool?.uuid
    let leadSchoolIsEmployingSchool = (record?.trainingDetails?.leadSchoolIsEmployingSchool == "true") ? true : false
    delete record.trainingDetails.leadSchoolIsEmployingSchool // Checkbox no longer needed

    // No answer given / answer not understood
    if (!schoolUuid){
      res.redirect(`${recordPath}/training-details/lead-school${referrer}`)
    }
    else {

      let selectedSchool = data.schools.find(school => school.uuid == schoolUuid)
      // Seed records might have schools that aren't in our schools list
      // This may happen if a user tries to edit an existing seed record
      if (!selectedSchool) {
        console.log(`School not found - you probably need to update the seed records`)
      }
      else {
        record.trainingDetails.leadSchool = selectedSchool
      }

      // Some routes have a conditional next question
      if (utils.requiresField(record, 'employingSchool')){

        // If an employing school isn’t already set, users can tell us the employing school
        // is the same as the employing school
        if (leadSchoolIsEmployingSchool && !record?.trainingDetails?.employingSchool) {
          record.trainingDetails.employingSchool = selectedSchool
          // Skip to next page
          res.redirect(`${recordPath}/training-details/confirm${referrer}`)
        }
        else {
          res.redirect(`${recordPath}/training-details/employing-school${referrer}`)
        }
        
      }
      else {
        res.redirect(`${recordPath}/training-details/confirm${referrer}`)
      }
    }

  })

  router.post(['/:recordtype/:uuid/training-details/employing-school','/:recordtype/training-details/employing-school'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    let schoolUuid = record?.trainingDetails?.employingSchool?.uuid
    if (!schoolUuid){
      res.redirect(`${recordPath}/training-details/employing-school${referrer}`)
    }
    else {
      let selectedSchool = data.schools.find(school => school.uuid == schoolUuid)

      // Seed records might have schools that aren't in our schools list
      // This may happen if a user tries to edit an existing seed record
      if (!selectedSchool) {
        console.log(`School not found - you probably need to update the seed records`)
      }
      else {
        record.trainingDetails.employingSchool = selectedSchool
      }

      res.redirect(`${recordPath}/training-details/confirm${referrer}`)
    }
  })

  // =============================================================================
  // Course details
  // =============================================================================

  // Show pick-course or pick-route depending on if current provider has courses
  // on Publish

  router.get(['/:recordtype/:uuid/course-details','/:recordtype/course-details'], function (req, res) {
    const data = req.session.data
    const record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    let route = data.record?.route

    if (!route || !record.provider) {
      if (!route) console.log("Error: route not set")
      if (!record?.provider) console.log("Error: provider not set")
      res.redirect("/records")
    }
    else {
      let providerCourses = utils.getProviderCourses(data.courses, record.provider, route, data)

      // Some courses for selected route
      if (providerCourses.length) {
        res.redirect(`${recordPath}/course-details/pick-course${referrer}`)
      }
      // If no courses, go straight to course details
      else {
        res.redirect(`${recordPath}/course-details/details${referrer}`)
      }
    }

  })

  // Picking a course
  router.post(['/:recordtype/:uuid/course-details/pick-course','/:recordtype/course-details/pick-course'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let enabledRoutes = data.settings.enabledTrainingRoutes
    let route = record?.route
    let providerCourses = utils.getProviderCourses(data.courses, record.provider, route, data)
    let selectedCourse = _.get(data, 'record.selectedCourseTemp')

    // User shouldn’t have been on this page, send them to details
    if (providerCourses.length == 0){
      res.redirect(`${recordPath}/course-details/details${referrer}`)
    }
    // No data, return to page
    else if (!selectedCourse){
      res.redirect(`${recordPath}/course-details/pick-course${referrer}`)
    }
    else if (selectedCourse == "Other"){
      if (_.get(record, 'courseDetails.isPublishCourse')){
        // User has swapped from a publish to a non-publish course. Delete existing data
        delete record.courseDetails
      }
      res.redirect(`${recordPath}/course-details/details${referrer}`)
    }

    else {
      // selectedCourse could be an id of a course or a radio that contains an autocomplete
      if (selectedCourse == "publish-course") {

        // Default value from select (used by defualt for no-js)
        selectedCourse = _.get(data, 'record.selectedCourseAutocompleteTemp')

        // Read the raw autocomplete value.
        // We can’t read the autocomplete value from the select because the Publish autocomplete
        // values include hints, so the correct option in the select doesn’t get chosen by the js.
        // Instead we read the raw value of the autocomplete input itself and map that string back
        // to the id of the course.
        let selectedCourseRawAutocomplete = req.body._autocompleteRawValue_publishCourse
        // Will only exist if js
        if (selectedCourseRawAutocomplete){
          selectedCourse = providerCourses.find(course => {
            return `${course.subject} (${course.code})` == req.body._autocompleteRawValue_publishCourse
          })?.id
        }
      }
      // Assume everything else is a course id
      let courseIndex = (selectedCourse) ? providerCourses.findIndex(course => course.id == selectedCourse) : false
      if (!courseIndex || courseIndex < 0){
        // Nothing found for current provider (something has gone wrong)
        console.log(`Provider course ${selectedCourse} not recognised`)
        res.redirect(`${recordPath}/course-details/pick-course${referrer}`)
      }
      else {
        // Copy over that provider’s course data
        record.courseDetails = providerCourses[courseIndex]
        res.redirect(`${recordPath}/course-details/confirm-publish-details${referrer}`)
      }
    }
  })

  // Confirm that the pubish course is correct. This is shown instead of the regular /confirm
  // page when selecting a publish course. The regular /confirm page is still shown when 
  // reviewing from a summary page, or after editing other details.
  // This route is needed because we need to conditionally pass on to /allocated-place if
  // the route and subject match certain conditions.
  router.post(['/:recordtype/:uuid/course-details/confirm-publish-details','/:recordtype/course-details/confirm-publish-details'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let referrer = utils.getReferrer(req.query.referrer)
    let recordPath = utils.getRecordPath(req)
    // Copy route up to higher level
    delete record.selectedCourseTemp
    delete record.selectedCourseAutocompleteTemp

    let isAllocated = utils.hasAllocatedPlaces(record)

    if (isAllocated) {
      // After /allocated-place the journey will match other course-details routes
      res.redirect(`${recordPath}/course-details/allocated-place${referrer}`)
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
        record.courseDetails.status = "Completed"
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
  router.post(['/:recordtype/:uuid/course-details/pick-route','/:recordtype/course-details/pick-route'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let enabledRoutes = data.settings.enabledTrainingRoutes
    let selectedRoute = _.get(data, 'record.route')

    // No data, return to page
    if (!selectedRoute){
      res.redirect(`${recordPath}/course-details/pick-route${referrer}`)
    }
    else if (selectedRoute == "Other"){
      res.redirect(`/new-record/course-details/route-not-supported${referrer}`)
    }
    else {
      res.redirect(`${recordPath}/course-details/details${referrer}`)
    }
  })


  router.post(['/:recordtype/:uuid/course-details/details','/:recordtype/course-details/details'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let referrer = utils.getReferrer(req.query.referrer)

    let courseDetails = _.get(data, 'record.courseDetails')
    let recordPath = utils.getRecordPath(req)
    // No data, return to page
    if (!courseDetails){
      res.redirect(`${recordPath}/course-details`)
    }
    
    // Merge autocomplete and radio answers
    if (courseDetails.ageRange == 'Other age range'){
      courseDetails.ageRange = courseDetails.ageRangeOther
      delete courseDetails.ageRangeOther
    }

    record.courseDetails = courseDetails

    let isAllocated = utils.hasAllocatedPlaces(record)

    if (isAllocated) {
      res.redirect(`${recordPath}/course-details/allocated-place${referrer}`)
    }
    else {
      res.redirect(`${recordPath}/course-details/confirm${referrer}`)
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
    let degreeCount = (degrees) ? degrees.length : 0
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
      // Delete degree section if it’s empty
      if (data.record.degree.items.length == 0){
        delete data?.record?.degree
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

    newDegree.id = faker.random.uuid()

    let existingDegrees = _.get(data, "record.degree.items") || []
    let degreeIndex = req.params.index
    let recordPath = utils.getRecordPath(req)

    console.log(newDegree)

    // This is so we can look up isInternational
    if (existingDegrees[degreeIndex]) {
      newDegree = Object.assign({}, existingDegrees[degreeIndex], newDegree)
    }

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

    if (existingDegrees[degreeIndex]) {
      // Might be a partial update, so merge the new with the old
      existingDegrees[degreeIndex] = Object.assign({}, existingDegrees[degreeIndex], newDegree)
    }
    else {
      existingDegrees.push(newDegree)
    }

    _.set(data, 'record.degree.items', existingDegrees)

    if (existingDegrees?.length > 1){
      res.redirect(`${recordPath}/degree/bursary-selection${referrer}`)
    }
    else {
      res.redirect(`${recordPath}/degree/confirm${referrer}`)
    }

  })

  // =============================================================================
  // Placements
  // =============================================================================
  
  // Record: Can they add placements? Sends them onwards or marks placements complete
  router.post(['/:recordtype/:uuid/placements/can-add-placement-answer','/:recordtype/placements/can-add-placement-answer'], function (req, res) {
    const data = req.session.data
    
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let record = data.record // copy record
    
    if (!record?.placement?.hasPlacements) {
      res.redirect(`${recordPath}/placements/can-add-placement${referrer}`)
    }
    // Are they able to add placement details? (Shared on both draft and record)
    if (record.placement.hasPlacements == 'Yes'){
      // carry on and add one
      delete record?.placement.status
      res.redirect(`${recordPath}/placements/add${referrer}`)
    }
    // Record specific routes
    if (req.params.recordtype == 'record') {
      utils.updateRecord(data, record)

      if (record.placement.hasPlacements == 'Not yet'){
    
        // send them back to the record
        if (referrer){
          res.redirect(req.query.referrer)
        }
        else {
          res.redirect(`${recordPath}`)
        }
      }
    } 
    // Draft specific routes
    else if (req.params.recordtype != 'record') {
      if (record.placement.hasPlacements == 'Not yet') {
        
        // mark the Placements section as complete
        _.set(record,'placement.status',"Completed")
        
        // send them to the confirmation
        if (referrer){
          res.redirect(req.query.referrer)
        }
        else {
          res.redirect(`${recordPath}/overview`)
          // res.redirect(`${recordPath}/placements/confirm${referrer}`)
        }
      }
    }
    else {
      res.redirect(`${recordPath}/placements/can-add-placement${referrer}`)
    }
    
  })

  // Add a placement - generate a UUID and send the user to it
  router.get(['/:recordtype/:uuid/placements/add','/:recordtype/placements/add'], function (req, res) {
    const data = req.session.data
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let placementUuid = faker.random.uuid()
    
    // delete data.placementTemp
    
    res.redirect(`${recordPath}/placements/${placementUuid}/details${referrer}`)
  }) 

  // Delete placement at a given UUID
  router.get(['/:recordtype/:uuid/placements/:placementUuid/delete','/:recordtype/placements/:placementUuid/delete'], function (req, res) {
    const data = req.session.data
    let recordPath = utils.getRecordPath(req)
    let placementUuid = req.params.placementUuid
    let referrer = utils.getReferrer(req.query.referrer)
    let placements = data.record?.placement?.items || []
    let placementIndex = placements.findIndex(placement => placement.id == placementUuid)
    let minPlacementsRequired = data.settings.minPlacementsRequired
    
    if (_.get(data, "record.placement.items[" + placementIndex + "]")){
      _.pullAt(data.record.placement.items, [placementIndex]) //delete item at index
      // Clear data if there are no more degrees - so the task list thinks the section is not started
      req.flash('success', 'Trainee placement deleted')
      
      // Delete degree section if it’s empty
      if (data.record.placement.items.length == 0){
        delete data.record.placement
      }
      // Ensure section can't be complete if less than required placements
      else if (data.record.placement.items.length < minPlacementsRequired) {
        delete data.record.placement.status
      }
    }
    if (req.params.recordtype == 'record'){
      // This updates the record immediately without a confirmation.
      // Probably needs a bespoke confirmation page as the empty placement
      // confirmation page looks weird - and we probably don't want
      // records without a placement anyway.
      utils.updateRecord(data, data.record)
    }
    if (!data.record?.placement){
      res.redirect(`${recordPath}/placements/can-add-placement${referrer}`)
    } 
    else if (referrer){
      res.redirect(req.query.referrer)
    }
    else {
      res.redirect(`${recordPath}/placements/confirm${referrer}`)
    }
  })

  // Forward placement requests to the right template, including the index
  router.get(['/:recordtype/:uuid/placements/:placementUuid/:page','/:recordtype/placements/:placementUuid/:page'], function (req, res) {
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    res.render(`${req.params.recordtype}/placements/${req.params.page}`, {placementUuid: req.params.placementUuid})
  })

  // Save placement data from temporary store
  router.post(['/:recordtype/:uuid/placements/:placementUuid/confirm','/:recordtype/placements/:placementUuid/confirm'], function (req, res) {
    const data = req.session.data
    let placement = data.placementTemp
    delete data.placementTemp
    let referrer = utils.getReferrer(req.query.referrer)
    
    let placementUuid = req.params.placementUuid
    let existingPlacements = data.record?.placement?.items || []
    let placementIndex = existingPlacements.findIndex(placement => placement.id == placementUuid)
    let recordPath = utils.getRecordPath(req)

    if (existingPlacements.length && existingPlacements[placementIndex]) {
      // Might be a partial update, so merge the new with the old
      existingPlacements[placementIndex] = Object.assign({}, existingPlacements[placementIndex], placement)
    }
    else {
      placement.id = placementUuid
      existingPlacements.push(placement)
    }

    delete data.record.placement.hasPlacements
    delete data.record.placement.placementsNotRequiredReason
    
    _.set(data, 'record.placement.items', existingPlacements)

    res.redirect(`${recordPath}/placements/confirm${referrer}`)
  })

}
