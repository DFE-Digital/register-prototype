const express = require('express')
const router = express.Router()
const faker = require('faker')
const path = require('path')
const moment = require('moment')
const filters = require('./filters.js')()
const _ = require('lodash')
const utils = require('./../lib/utils')

// =============================================================================
// Catch all
// Used to pass common data to views
// Needs to be before other routes
// =============================================================================
router.all('*', function(req, res, next){
  // referrer not really needed as this in query
  // but too late now as it's used everywhere
  res.locals.referrer = req.query.referrer
  res.locals.query = req.query
  res.locals.flash = req.flash('success') // pass through 'success' messages only
  next()
})

router.post('*', function(req, res, next){
  if (req.session.data.successFlash) {
    req.flash('success', req.session.data.successFlash)
    delete req.session.data.successFlash
  }
  next()
})

// =============================================================================
// Individual pages
// =============================================================================
// Records list
require('./routes/records-list')(router)

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
