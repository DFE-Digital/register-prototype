const _ = require('lodash')
const express = require('express')
const faker = require('faker')
const moment = require('moment')
const path = require('path')
const router = express.Router()
const url = require('url')
const utils = require('./lib/utils')
const fs = require('fs');

// =============================================================================
// Catch all
// Used to pass common data to views
// Needs to be before other routes
// =============================================================================
router.all('*', function(req, res, next){
  const data = req.session.data
  // referrer not really needed as this in query
  // but too late now as it's used everywhere
  res.locals.referrer = req.query.referrer
  res.locals.query = req.query
  res.locals.flash = req.flash('success') // pass through 'success' messages only
  res.locals.currentPageUrl = url.parse(req.url).pathname

  // Todo - move this stuff to middleware?
  // Need to also save to locals as saving to data at this point won’t be available to the view unless refreshed
  data.isHatModel = (data.settings.providerModel == 'hat-model') ? true : false
  data.isBlendedModel = (data.settings.providerModel == 'blended-model') ? true : false
  data.signedInProviders = (data.isBlendedModel) ? data.settings.userProviders : [data.settings.userActiveProvider]
  data.providerRecords = utils.filterByProvider(data.records, data.signedInProviders)

  res.locals.data.isHatModel = data.isHatModel
  res.locals.data.isBlendedModel = data.isBlendedModel
  res.locals.data.signedInProviders = data.signedInProviders
  // Double check that active provider is listed in signedInProviders
  if (!data.signedInProviders.includes(data.settings.userActiveProvider)){
    console.log(`Error: active provider (${data.settings.userActiveProvider}) not in signedInProviders (${data.signedInProviders})`)
    console.log(`Using first signed in provider (${data.signedInProviders[0]}) as active provider`)
    data.settings.userActiveProvider = data.signedInProviders[0]
    res.locals.data.settings.userActiveProvider = data.settings.userActiveProvider
  }
  res.locals.data.providerRecords = data.providerRecords
  next()
})

// Delete query string if clearQuery set
// This lets us give urls to reserach participants that set up data correctly
// and have the query string self-delete once done
router.get('*', function(req, res, next){
  let requestedUrl = url.parse(req.url).pathname
  if (req?.query?.clearQuery){
    delete req.session.data.clearQuery
    res.redirect(requestedUrl)
  }
  else {
    next()
  }
})

router.post('*', function(req, res, next){
  if (req.session.data.successFlash) {
    req.flash('success', req.session.data.successFlash)
    delete req.session.data.successFlash
  }
  next()
})

router.get('/search-index', function(req, res){
  fs.readFile('./app/lib/search-index.json', 'utf8', (err, data) => {
    if (err) {
      // throw err
    }
    let searchIndex = JSON.parse(data)
    res.send(searchIndex)
  })
})

// =============================================================================
// Individual pages
// =============================================================================
// Records list
require('./routes/records-list-routes')(router)

// =============================================================================
// Shared routes - add / edit record data
//
// These routes are for editing data on new records and existing records
// Match against 'new-record' and 'uuid record' paths and work for both.
// =============================================================================
require('./routes/shared-edit-routes')(router)

// =============================================================================
// New records
// =============================================================================
require('./routes/new-record-routes')(router)

// =============================================================================
// Existing records
// =============================================================================
require('./routes/existing-record-routes')(router)

// =============================================================================
// Bulk actions
// =============================================================================
require('./routes/bulk-action-routes')(router)


module.exports = router
