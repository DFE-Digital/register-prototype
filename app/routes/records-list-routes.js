const url = require('url')
const _ = require('lodash')
const utils = require('./../lib/utils')
const objectFilters = require('./../filters/objects.js').filters
const years = require('./../data/years.js')

// Work around a bug where occasionally _unchecked would appear
// Also coerce to array to be easier to work with
const cleanInputData = data => {
  if (!data || data == '_unchecked') {
    return undefined
  }
  else {
    data = [].concat(data) // coerce to arrays so we can filter them
    // _unchecked sometimes appears - can't track down what's causing it
    data = data.filter(item => item != '_unchecked')
    return (data.length == 0) ? undefined : data // return undefined if array now empty
  }
}

const getSearchQuery = req => req.query?.searchQuery || ""

// Clean up query to create a filters object with selected filters
const getFilters = req => {

  // Copy the query
  let query = Object.assign({}, req.query)
  // let searchQuery = query?.searchQuery || ""
  // let searchQueryLowercase = searchQuery.toLowerCase()


  // Needed because this is coming via query string and not auto-data store
  // And these values may contain '_unchecked'
  let filtersToClean = [
  'filterStatus',
  'filterCompleteStatus',
  'filterSource',
  'filterLevel',
  'filterStudyMode',
  'filterCycle',
  'filterUserProviders',
  'filterTrainingRoutes']
  filtersToClean.forEach(filter => query[filter] = cleanInputData(query[filter]))

  // Remap to an object so we can pass it to the filterRecords function
  // that is shared by the
  let filters = {
    status: query.filterStatus,
    source: query.filterSource,
    completeStatus: query.filterCompleteStatus,
    cycle: query.filterCycle,
    level: query.filterLevel,
    studyMode: query.filterStudyMode,
    providers: query.filterUserProviders,
    trainingRoutes: query.filterTrainingRoutes,
    subject: query.filterSubject
  }

  return filters
}

// Todo: this could probably be simpler
const getHasFilters = (filters, searchQuery) => {
  return !!(filters.status) 
  || !!(filters.completeStatus)
  || !!(filters.source)
  || !!(filters.level)
  || !!(filters.studyMode)
  || !!(searchQuery)
  || !!(filters.subject && filters.subject != 'All subjects')

  // Cycles / start year disabled as we default select specific years if no filters are selected
  // This means that 'historic' trainees are excluded by default. With this 'default' state it looked
  // weird to have the 'selected' area on by default.
  // || !!(filters.cycle)

  || !!(filters.trainingRoutes)
  || !!(filters.providers)
}

// Make object to hold details of selected filters with appropriate links to clear each one
const getSelectedFilters = req => {

  let query = Object.assign({}, req.query)
  let filters = getFilters(req)
  let searchQuery = getSearchQuery(req)
  let pathname = url.parse(req.url).pathname

  let hasFilters = getHasFilters(filters, searchQuery)

  if (!hasFilters) return false

  let selectedFilters = {
    categories: []
  }

  if (searchQuery) {
    let newQuery = Object.assign({}, query)
    delete newQuery.searchQuery
    selectedFilters.categories.push({
      heading: { text: "Text search" },
      items: [{
        text: searchQuery,
        href: url.format({
          pathname,
          query: newQuery,
        })
      }]
    })
  }

  // if (filters.cycle) {
  //   selectedFilters.categories.push({
  //     heading: { text: 'Training year' },
  //     items: filters.cycle.map((cycle) => {

  //       let newQuery = Object.assign({}, query)
  //       newQuery.filterCycle = filters.cycle.filter(a => a != cycle)
  //       return {
  //         text: cycle,
  //         href: url.format({
  //           pathname,
  //           query: newQuery,
  //         })
  //       }
  //     })
  //   })
  // }

  if (filters.completeStatus) {
    selectedFilters.categories.push({
      heading: { text: 'Draft completion' },
      items: filters.completeStatus.map((completeStatus) => {

        let newQuery = Object.assign({}, query)
        newQuery.filterCompleteStatus = filters.completeStatus.filter(a => a != completeStatus)
        return {
          text: completeStatus,
          href: url.format({
            pathname,
            query: newQuery,
          })
        }
      })
    })
  }

  if (filters.source) {
    selectedFilters.categories.push({
      heading: { text: 'Record source' },
      items: filters.source.map((source) => {

        let newQuery = Object.assign({}, query)
        newQuery.filterSource = filters.source.filter(a => a != source)
        return {
          text: source,
          href: url.format({
            pathname,
            query: newQuery,
          })
        }
      })
    })
  }

  if (filters.level) {
    selectedFilters.categories.push({
      heading: { text: 'Course level' },
      items: filters.level.map((level) => {

        let newQuery = Object.assign({}, query)
        newQuery.filterLevel = filters.level.filter(a => a != level)
        return {
          text: level,
          href: url.format({
            pathname,
            query: newQuery,
          })
        }
      })
    })
  }

  if (filters.studyMode) {
    selectedFilters.categories.push({
      heading: { text: 'Full time or part time' },
      items: filters.studyMode.map((studyMode) => {

        let newQuery = Object.assign({}, query)
        newQuery.filterLevel = filters.studyMode.filter(a => a != studyMode)
        return {
          text: studyMode,
          href: url.format({
            pathname,
            query: newQuery,
          })
        }
      })
    })
  }

  if (filters.providers) {
    selectedFilters.categories.push({
      heading: { text: 'Provider' },
      items: filters.providers.map((provider) => {

        let newQuery = Object.assign({}, query)
        newQuery.filterUserProviders = filters.providers.filter(a => a != provider)

        return {
          text: provider,
          href: url.format({
            pathname,
            query: newQuery,
          })
        }
      })
    })
  }

  if (filters.trainingRoutes) {
    selectedFilters.categories.push({
      heading: { text: 'Training route' },
      items: filters.trainingRoutes.map((route) => {

        let newQuery = Object.assign({}, query)
        newQuery.filterTrainingRoutes = filters.trainingRoutes.filter(a => a != route)

        return {
          text: route,
          href: url.format({
            pathname,
            query: newQuery,
          })
        }
      })
    })
  }

  if (filters.status) {
    selectedFilters.categories.push({
      heading: { text: 'Status' },
      items: filters.status.map((status) => {

        let newQuery = Object.assign({}, query)
        newQuery.filterStatus = filters.status.filter(a => a != status)

        return {
          text: status,
          href: url.format({
            pathname,
            query: newQuery,
          })
        }
      })
    })
  }

  if (filters.subject && filters.subject != 'All subjects') {
    let newQuery = Object.assign({}, query)
    delete newQuery.filterSubject
    selectedFilters.categories.push({
      heading: { text: "Subject" },
      items: [{
        text: filters.subject,
        href: url.format({
          pathname,
          query: newQuery,
        })
      }]
    })
  }

  return selectedFilters
}


module.exports = router => {

  router.get(['/records'], function (req, res) {
    const data = req.session.data

    // We’re not in a record, so make sure to flush record data
    delete req.session?.data?.record
    delete res.locals.data?.record

    // Grab filters and clean them up
    let filters = getFilters(req)

    // If there’s no query string at all, we want to apply some defaults
    let hasQueryString = Boolean(Object.keys(req.query).length)
    // if (!hasQueryString) filters.cycle = ["2020 to 2021"]
    if (!hasQueryString) filters.cycle = years.defaultVisibleYears

    let searchQuery = getSearchQuery(req)

    let hasFilters = getHasFilters(filters, searchQuery)

    // Show selected filters as labels that can be individually removed
    let selectedFilters = getSelectedFilters(req)

    // Filter records using the filters provided
    let filteredRecords = utils.filterRecords(data.records, data, filters)
    // console.log(req.query)
    // if (!hasFilters) filteredRecords = filteredRecords.filter(record => record.academicYear == "2021 to 2022")

    // All records except drafts
    filteredRecords = objectFilters.removeWhere(filteredRecords, 'status', ["Draft", "Apply draft"])

    // Search traineeId and full name
    filteredRecords = utils.filterRecordsBySearchTerm(filteredRecords, searchQuery)

    // Sort records by sortOrder, defaulting to updatedDate
    filteredRecords = utils.sortRecordsBy(filteredRecords, (req?.query?.sortOrder || 'updatedDate'))

    res.render('records', {
      filteredRecords,
      hasFilters,
      selectedFilters
    })
  })

  router.get(['/drafts'], function (req, res) {
    const data = req.session.data

    // We’re not in a record, so make sure to flush record data
    delete req.session?.data?.record
    delete res.locals.data?.record

    // Grab filters and clean them up
    let filters = getFilters(req)
    let searchQuery = getSearchQuery(req)

    let hasFilters = getHasFilters(filters, searchQuery)

    // Show selected filters as labels that can be individually removed
    let selectedFilters = getSelectedFilters(req)

    // Filter records using the filters provided
    let filteredRecords = utils.filterRecords(data.records, data, filters)

    // Only drafts
    filteredRecords = utils.filterRecordsBy(filteredRecords, 'status', ["Draft", "Apply draft"])

    // Search traineeId and full name
    filteredRecords = utils.filterRecordsBySearchTerm(filteredRecords, searchQuery)

    // Sort records by sortOrder, defaulting to updatedDate
    filteredRecords = utils.sortRecordsBy(filteredRecords, (req?.query?.sortOrder || 'updatedDate'))



    res.render('drafts', {
      filteredRecords,
      hasFilters,
      selectedFilters
    })
  })

}
