const faker = require('faker')
const path = require('path')
const moment = require('moment')
const utils = require('./../lib/utils')
const _ = require('lodash')

// In function because this is too big to pass around in session
const getSchools = () => {
  return require('./../data/gis-schools.js')
}

module.exports = router => {

  // Load up data for a record
  // This implimentation makes a copy of the record and stores it in a temporary location
  // any edits happen on this temporary data - depending on the journey, some routes may then
  // copy this temp record back to the main records list. This means we can support things like
  // cancelling changes - as we just need to load the original record again.
  // One downside is it means the prototype doesn’t support multiple records being opened
  // at once.
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

    // Redirect to task draft journey if still a draft
    if (utils.isDraft(record)){
      res.redirect('/new-record/overview')
    }
    // Only submitted records
    else {
      res.locals.record = record
      res.render('record')
    }
  })


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
    res.redirect(`${recordPath}/training-details/confirm${referrer}`)
  })

  // =============================================================================
  // Schools
  // =============================================================================

  // Forward on to the appropriate schools page depending on what the route needs
  router.get(['/:recordtype/:uuid/schools','/:recordtype/schools'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    if (utils.requiresField(record, 'leadSchool')){
      res.redirect(`${recordPath}/schools/lead-school${referrer}`)
    }
    else if (utils.requiresField(record, 'employingSchool')){
      res.redirect(`${recordPath}/schools/employing-school${referrer}`)
    }
    else {
      // This path shouldn't be possible
      res.redirect(`${recordPath}/schools/confirm${referrer}`)
    }
  })

  // Toggle between an autocomplete page and a search results page on the basis of there being a search query
  router.get(['/:recordtype/:uuid/schools/lead-school','/:recordtype/schools/lead-school'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let schoolSearchTerm = req.query?._schoolSearch
    const schools = getSchools()

    if (schoolSearchTerm){
      let results = false
      let resultsCount = 0
      results = utils.searchSchools(schools, schoolSearchTerm)
      resultsCount = results.length
      results = results.slice(0, 15) // truncate results
      res.render(`${req.params.recordtype}/schools/lead-school-results`, { searchResults: results, resultsCount })
    }
    else {
      res.render(`${req.params.recordtype}/schools/lead-school`)
    }

  })

  // This route deals with users searching for schools by string or having selected a
  // school from a set of results.
  router.post(['/:recordtype/:uuid/schools/lead-school','/:recordtype/schools/lead-school'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    const schools = getSchools()

    // Input added with js by the autocomplete
    let autocompleteRawValue = req.body?._autocomplete_raw_value_school_picker

    // School selected via autocomplete
    let autocompleteUuid = req.body?._autocomplete_result_uuid

    // AutocompleteUuid isn’t always reliable
    // If a user has made a valid selection then goes back to edit their answer, autocompleteUuid will be filled
    // with their previous answer. If they then type something new in to the autocomplete but don’t pick an answer,
    // then the old Uuid will get submitted. Here we check that the school name for the provided Uuid matches the
    // raw autocomplete string submitted. If they don’t match, wipe the UUID as it’s invalid - and instead we should
    // run a string search for the given name.
    if (autocompleteUuid && autocompleteRawValue){
      let selectedSchool = schools.find(school => school.uuid == autocompleteUuid)
      if (selectedSchool?.schoolName != autocompleteRawValue){
        autocompleteUuid = undefined
      }
    }

    // Used for no-js searching
    // Or where a user types in to the autocomplete too quickly
    let schoolSearchTerm = (!autocompleteUuid && autocompleteRawValue) || req.body?._schoolSearch || false

    let searchResultRadios = req.body?._searchResultRadios
    let schoolResultUuid = (searchResultRadios && searchResultRadios != 'searchAgain') ? searchResultRadios : false

    // Uuid could come via two form inputs
    let schoolUuid = autocompleteUuid || schoolResultUuid || false

    let leadSchoolIsEmployingSchool = (record?.schools?.leadSchoolIsEmployingSchool == "true") ? true : false
    delete record?.schools?.leadSchoolIsEmployingSchool // Checkbox no longer needed

    // Search again
    if (schoolSearchTerm && !schoolUuid){
      let queryParams = utils.addQueryParam(referrer, `_schoolSearch=${schoolSearchTerm}`)
      res.redirect(`${recordPath}/schools/lead-school${queryParams}`)
    }
    // No answer given and no search term
    else if (!schoolUuid){
      res.redirect(`${recordPath}/schools/lead-school${referrer}`)
    }
    else {
      let selectedSchool = schools.find(school => school.uuid == schoolUuid)

      // Seed records might have schools that aren't in our schools list
      // This may happen if a user tries to edit an existing seed record
      if (!selectedSchool) {
        console.log(`School not found - you probably need to update the seed records`)
      }
      else {
        // Using _.set as lead school might not exist yet
        _.set(record, 'schools.leadSchool', selectedSchool)
      }

      // Some routes have a conditional next question
      // We bypass this if we've already got an answer for employing school
      if (utils.requiresField(record, 'employingSchool') && !record?.schools?.employingSchool){

        // If an employing school isn’t already set, users can tell us the employing school
        // is the same as the employing school
        if (leadSchoolIsEmployingSchool && !record?.schools?.employingSchool) {
          // record.schools.employingSchool = selectedSchool
          _.set(record, 'schools.employingSchool', selectedSchool)
          // Skip to next page
          res.redirect(`${recordPath}/schools/confirm${referrer}`)
        }
        else {
          res.redirect(`${recordPath}/schools/employing-school${referrer}`)
        }
        
      }
      else {
        res.redirect(`${recordPath}/schools/confirm${referrer}`)
      }
    }

  })

  // Toggle between an autocomplete page and a search results page on the basis of there being a search query
  router.get(['/:recordtype/:uuid/schools/employing-school','/:recordtype/schools/employing-school'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let schoolSearchTerm = req.query?._schoolSearch
    const schools = getSchools()

    if (schoolSearchTerm){
      let results = false
      let resultsCount = 0
      
      results = utils.searchSchools(schools, schoolSearchTerm)
      resultsCount = results.length
      results = results.slice(0, 15) // truncate results
      res.render(`${req.params.recordtype}/schools/employing-school-results`, { searchResults: results, resultsCount })
    }
    else {
      res.render(`${req.params.recordtype}/schools/employing-school`)
    }

  })

  // This route deals with users searching for schools by string or having selected a
  // school from a set of results.
  router.post(['/:recordtype/:uuid/schools/employing-school','/:recordtype/schools/employing-school'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    const schools = getSchools()

    // Input added with js by the autocomplete
    let autocompleteRawValue = req.body?._autocomplete_raw_value_school_picker

    // School selected via autocomplete
    let autocompleteUuid = req.body?._autocomplete_result_uuid

    // AutocompleteUuid isn’t always reliable
    // If a user has made a valid selection then goes back to edit their answer, autocompleteUuid will be filled
    // with their previous answer. If they then type something new in to the autocomplete but don’t pick an answer,
    // then the old Uuid will get submitted. Here we check that the school name for the provided Uuid matches the
    // raw autocomplete string submitted. If they don’t match, wipe the UUID as it’s invalid - and instead we should
    // run a string search for the given name.
    if (autocompleteUuid && autocompleteRawValue){

      let selectedSchool = schools.find(school => school.uuid == autocompleteUuid)
      if (selectedSchool?.schoolName != autocompleteRawValue){
        autocompleteUuid = undefined
      }
    }

    // Used for no-js searching
    // Or where a user types in to the autocomplete too quickly
    let schoolSearchTerm = (!autocompleteUuid && autocompleteRawValue) || req.body?._schoolSearch || false

    let searchResultRadios = req.body?._searchResultRadios
    let schoolResultUuid = (searchResultRadios && searchResultRadios != 'searchAgain') ? searchResultRadios : false

    // Uuid could come via two form inputs
    let schoolUuid = autocompleteUuid || schoolResultUuid || false

    // Search again
    if (schoolSearchTerm && !schoolUuid){
      let queryParams = utils.addQueryParam(referrer, `_schoolSearch=${schoolSearchTerm}`)
      res.redirect(`${recordPath}/schools/employing-school${queryParams}`)
    }
    // No answer given and no search term
    else if (!schoolUuid){
      res.redirect(`${recordPath}/schools/employing-school${referrer}`)
    }
    else {
      let selectedSchool = schools.find(school => school.uuid == schoolUuid)

      // Seed records might have schools that aren't in our schools list
      // This may happen if a user tries to edit an existing seed record
      if (!selectedSchool) {
        console.log(`School not found - you probably need to update the seed records`)
      }
      else {
        // Using _.set as lead school might not exist yet
        _.set(record, 'schools.employingSchool', selectedSchool)
      }

      res.redirect(`${recordPath}/schools/confirm${referrer}`)
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
      // If it’s an Apply draft we let users pick from all providers
      if (utils.sourceIsApply(record)) route = false

      // Look up courses offered by this provider
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
    if (utils.sourceIsApply(record)) route = false
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
            return utils.getCourseName(course) == req.body._autocompleteRawValue_publishCourse
          })?.id
        }
      }
      // Assume everything else is a course id
      let courseIndex = (selectedCourse) ? providerCourses.findIndex(course => course.id == selectedCourse) : false
      if (courseIndex < 0){
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

    // For apply records we let them pick a Publish course which 
    // might have a different route
    if (record.route != record.courseDetails.route){
      console.log(`The selected Publish course’s route does not match the draft’s route. Draft route changed to ${record.courseDetails.route}`)
      record.route = record.courseDetails.route
    }

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
          res.redirect(utils.getReferrerDestination(req.query.referrer))
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
          res.redirect(utils.getReferrerDestination(req.query.referrer))
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

    // Check for autocomplete submitted subject
    let subjectAutocomplete1 = req.body?._autocompleteRawValue_subject_1

    // Special handling for editing your answers to delete subjects.
    // Autocompletes make it hard to clear a value when used as an enhanced select.
    // Clearing the answer does not correctly select the empty select item. Instead,
    // we submit the raw autocomplete values and prefer them if they exist.
    if (subjectAutocomplete1){
      let subjectsTemp = [subjectAutocomplete1]
        .concat(req.body?._autocompleteRawValue_subject_2)
        .concat(req.body?._autocompleteRawValue_subject_3)
      record.courseDetails.subjects = subjectsTemp // Replace any existing data
    }

    // Clean up subjects data
    // Remove empty and force in to array
    record.courseDetails.subjects = [].concat(record.courseDetails.subjects.filter(Boolean))

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
      res.redirect(utils.getReferrerDestination(req.query.referrer))
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

    // This is so we can look up isInternational if already answered
    if (existingDegrees[degreeIndex]) {
      newDegree = Object.assign({}, existingDegrees[degreeIndex], newDegree)
    }

    // This is a hack because the autocomplete doesn’t pick the righ type 
    // in the select - so we defer to the autocomplete value instead
    let selectedTypeRawAutocomplete = req.body?._autocompleteRawValue_degreeTypeUK
    if (selectedTypeRawAutocomplete){
      newDegree.typeUK = selectedTypeRawAutocomplete
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
          res.redirect(utils.getReferrerDestination(req.query.referrer))
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
          res.redirect(utils.getReferrerDestination(req.query.referrer))
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
      res.redirect(utils.getReferrerDestination(req.query.referrer))
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
