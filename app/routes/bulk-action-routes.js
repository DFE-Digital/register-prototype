const _ = require('lodash')
const moment = require('moment')
const path = require('path')
const recordUtils = require('./../lib/record.js')
const url = require('url')
const utils = require('./route-utils')
const filters = require('./../filters.js')()

const getExampleBulkTrainees = data => {

  let bulkOptions = {
    trainingRoutes: ['Provider-led'],
    status: ["TRN received"],
    subject: "All subjects"
  }

  let filteredTrainees = utils.filterRecords(data.records, data, bulkOptions)

  // Grab first 6 trainees that match
  let traineeGroup = recordUtils.sortRecordsByLastName(filteredTrainees.slice(0, 6))
    .map(record => record.id)

  return traineeGroup
}

module.exports = router => {

  // Flush data when starting bulk action flow from the beginning
  router.get('/bulk-action/new', (req, res) => {
    const data = req.session.data
    delete data.bulk
    res.redirect(`/bulk-action`)
  })

  // Bypass action page
  router.get('/bulk-action/new/register-for-trn', (req, res) => {
    const data = req.session.data
    // Overwrites existing bulk object
    data.bulk = {
      action: "Submit a group of records and request TRNs",
    }
    res.redirect(`/bulk-action/filter-trainees`)
  })

  // Bypass action page
  router.get('/bulk-action/new/recommend-for-qts', (req, res) => {
    const data = req.session.data
    // Overwrites existing bulk object
    data.bulk = {
      action: "Recommend a group of trainees for QTS",
    }
    res.redirect(`/bulk-action/filter-trainees`)
  })

  // Bypass action page
  router.get('/bulk-action/new/direct', (req, res) => {
    const data = req.session.data
    let bulk = data.bulk
    bulk.directAction = true

    if (bulk.filteredTrainees){
      bulk.selectedTrainees = bulk.filteredTrainees
      if (bulk.action != "Recommend a group of trainees for QTS") res.redirect(`/bulk-action/confirm`)

      // Date answer needed
      else res.redirect(`/bulk-action/date`)
    }
    else {
      res.redirect(`/bulk-action/filter-trainees`)
    }

  })

  // WIP example for starting with a predefined list of trainees
  router.get('/bulk-action/example', (req, res) => {
    const data = req.session.data

    let exampleTrainees = getExampleBulkTrainees(data)

    // Overwrites existing bulk object
    data.bulk = {
      filteredTrainees: exampleTrainees,
      selectedTrainees: exampleTrainees, // preselect all trainees
      action: "Recommend a group of trainees for QTS",
      directAction: true
    }
    if (exampleTrainees.length > 0){
      res.redirect(`/bulk-action/date`)
    }
    else {
      res.redirect(`/bulk-action/select-trainees`)
    }
    
  })

  // Needs to provid filtered and selected trainees to view
  router.get('/bulk-action/select-trainees', (req, res) => {
    const data = req.session.data
    const bulk = data.bulk || {}
    const autoSelectTrainees = false // unsure if this is good

    let allRecords = recordUtils.sortRecordsByLastName(data.records)
    let filteredRecords
    let incompleteDraftCount = 0 // Only for QTS flow

    // Work out which checkboxes should be checked
    // We may want to pre-select checkboxes when landing on this page
    // so we either use the session data or the filtered list
    let selectedTrainees = bulk?.selectedTrainees || []

    // Hardcode a list of trainees
    // _.set(bulk, "filteredTrainees", getExampleBulkTrainees(data))

    // Something has gone wrong - can’t continue without an action
    if (!bulk?.action){
      res.redirect('/bulk-action')
    }

    // Missing any filtered trainees or means to filter them - can’t continue
    else if (!bulk?.filters && !bulk?.filteredTrainees){
      console.log('Bulk action: no filtered trainees, returning to records')
      res.redirect(`/records`)
    }

    // Have a group of trainees to show
    else {

      // Have a predefined list of trainees to show
      if (bulk?.filteredTrainees) {

        // Look up records from list
        filteredRecords = recordUtils.getRecordsById(allRecords, bulk.filteredTrainees)

        // If no pre-selected trainees, default to selecting them all
        if (autoSelectTrainees && !bulk?.selectedTrainees) selectedTrainees = bulk.filteredTrainees
      }

      // Coming from the filters page
      else if (bulk?.filters){

        // Create group of records using provided filters
        filteredRecords = utils.filterRecords(allRecords, data, bulk.filters)

        // Filter for only draft records that are complete
        if (bulk.action == 'Submit a group of records and request TRNs'){
          filteredRecords = filteredRecords
            .filter(record => record.status == 'Draft')
            .filter(record => {
              if (utils.recordIsComplete(record)) return true
              else {
                incompleteDraftCount++
                return false
              }
            })
        }

        // Filter for only records ready to be recommended for QTS
        else if (bulk.action == 'Recommend a group of trainees for QTS'){
          filteredRecords = filteredRecords.filter(record => record.status == 'TRN received')
        }

        // If no pre-selected trainees, default to selecting them all
        if (autoSelectTrainees && !bulk?.selectedTrainees) selectedTrainees = filteredRecords.map(record => record.id)

      }

      res.render(`bulk-action/select-trainees`, {
        filteredRecords,
        selectedTrainees,
        incompleteDraftCount
      })

    }

  })

  // Bypass date answer if not relevant - eg we already have it, or it's not needed
  router.post('/bulk-action/select-trainees-answer', (req, res) => {
    const bulk = req.session.data.bulk

    // No trainees selected, return to page
    if (!bulk?.selectedTrainees){
      res.redirect(`/bulk-action/select-trainees`)
    }

    // Date not needed, go to confirm
    else if (bulk.date || bulk.action != "Recommend a group of trainees for QTS") res.redirect(`/bulk-action/confirm`)

    // Date answer needed
    else res.redirect(`/bulk-action/date`)
  })

  // Convert date radios to actual dates
  router.post('/bulk-action/date-answer', (req, res) => {
    const data = req.session.data
    const bulk = data.bulk

    // Convert radio choices to real dates
    if (!bulk){
      res.redirect(`/bulk-action/date`)
    }
    else {
      let radioChoice = bulk.dateRadio
      if (radioChoice == "Today") {
        bulk.date = filters.toDateArray(filters.today())
      }
      if (radioChoice == "Yesterday") {
        bulk.date = filters.toDateArray(moment().subtract(1, "days"))
      }
    }

    res.redirect(`/bulk-action/confirm`)
  })

  // Save bulk action
  router.post('/bulk-action/save', (req, res) => {
    const data = req.session.data
    const bulk = data.bulk
    const records = data.records

    let successCount = 0
    let failCount = 0

    // Look up records from IDs
    let selectedRecords = recordUtils.getRecordsById(records, bulk.selectedTrainees)

    // Loop through each record
    selectedRecords.forEach(record => {
      let success = utils.doBulkAction(bulk.action, record, {date: bulk?.date})
      if (success) successCount++
      else failCount++
    })

    console.log(`Bulk action: ${successCount} ${filters.pluralise('success', successCount)}, ${failCount} ${filters.pluralise('failure', failCount)}.`)

    // Clear data for next time
    delete data.bulk

    req.flash('success', `${successCount} ${filters.pluralise('record', successCount)} submitted`)
    res.redirect(`/records/`)
  })

}
