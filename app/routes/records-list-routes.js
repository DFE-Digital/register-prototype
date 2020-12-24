const url = require('url')
const _ = require('lodash')
const utils = require('./../lib/utils')


// Kit checkboxes will output a string or array depending on number of options
// selected. This coerces to arrays so it's easier to work with.
const cleanInputData = checkboxes => {
  if (!checkboxes || checkboxes == '_unchecked') {
    return undefined
  }
  else {
    checkboxes = [].concat(checkboxes) // coerce to arrays so we can filter them
    checkboxes = checkboxes.filter(item => item != '_unchecked') // _unchecked sometimes appears - can't track down what's causing it
    checkboxes = (checkboxes.length == 0) ? undefined : checkboxes // return undefined if array now empty
    return checkboxes
  }
}


module.exports = router => {

  // Route for page
  // Filters
  router.get('/records', function (req, res) {
    const data = req.session.data

    // We're not in a record, so make sure to flush record data
    // Nb this only deletes on second page load because session data
    // is already set at this point and we're not redirecting
    delete req.session.data.record

    // Copy the query
    let query = Object.assign({}, req.query)
    let searchQuery = query?.searchQuery || ""
    let searchQueryLowercase = searchQuery.toLowerCase()


    // Needed because this is coming via query string and not auto-data store
    // And these values may contain '_unchecked'
    let filtersToClean = [
    'filterStatus',
    'filterCycle',
    'filterTrainingRoutes']
    filtersToClean.forEach(filter => query[filter] = cleanInputData(query[filter]))

    // Remap to an object so we can pass it to the filterRecords function
    // that is shared by the
    let filters = { 
      status: query.filterStatus,
      cycle: query.filterCycle,
      trainingRoutes: query.filterTrainingRoutes,
      subject: query.filterSubject
    }

    // Todo: this could probably be simpler
    const hasFilters = !!(filters.status) || !!(searchQuery) || !!(filters.subject && filters.subject != 'All subjects') || !!(filters.cycle) || !!(filters.trainingRoutes)

    // Filter records using the filters provided
    let filteredRecords = utils.filterRecords(data.records, data, filters)

    // Search traineeId and full name
    if (searchQuery){
      filteredRecords = filteredRecords.filter(record => {
        let fullName = record?.personalDetails?.fullName.toLowerCase() || "" // Draft records might not have a full name

        // Check that every part exists in the trainee’s name
        let searchParts = searchQueryLowercase.split(' ')
        let nameMatch = searchParts.every(part => fullName.includes(part))

        let traineeIdMatch = searchParts.some(part => (record?.trainingDetails?.traineeId || "").toLowerCase().includes(part))

        let trnMatch = searchParts.some(part => (record?.trn || "").toString().includes(part))

        return traineeIdMatch || trnMatch || nameMatch
      })
    }

    // Show selected filters as labels that can be individually removed
    let selectedFilters = null
    if (hasFilters) {
      selectedFilters = {
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
              pathname: '/records',
              query: newQuery,
            })
          }]
        })
      }

      if (filters.cycle) {
        selectedFilters.categories.push({
          heading: { text: 'Cycle' },
          items: filters.cycle.map((cycle) => {

            let newQuery = Object.assign({}, query)
            newQuery.filterCycle = filters.cycle.filter(a => a != cycle)
            return {
              text: cycle,
              href: url.format({
                pathname: '/records',
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
                pathname: '/records',
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
                pathname: '/records',
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
              pathname: '/records',
              query: newQuery,
            })
          }]
        })
      }

    }

    filteredRecords.sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime())

    if (query.sortOrder){
      switch (query.sortOrder) {
        case "lastName":
          filteredRecords.sort((a, b) => {
            if (a?.personalDetails?.familyName && b?.personalDetails?.familyName){
              return a.personalDetails.familyName.localeCompare(b.personalDetails.familyName)
            }
            else return (a?.personalDetails?.familyName) ? 1 : -1
          })
          break
        case "firstName":
          filteredRecords.sort((a, b) => {
            if (a?.personalDetails?.givenName && b?.personalDetails?.givenName){
              return a.personalDetails.givenName.localeCompare(b.personalDetails.givenName)
            }
            else return (a?.personalDetails?.givenName) ? 1 : -1
          })
          break
        // case "dateAdded":
        //   filteredRecords.sort((a,b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
        //   break
        default:
          // filteredRecords.sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime())
          break
      }
    }

    const createSortLink = sortBy => {
      let newQuery = Object.assign({}, query)
      newQuery.sortOrder = sortBy
      return url.format({
        pathname: '/records',
        query: newQuery,
      })
    }


    // newQuery.sortOrder = 'lastName'
    // let linkSortByName = url.format({
    //   pathname: '/records',
    //   query: newQuery,
    // })

    // newQuery.sortOrder = 'dateUpdated'
    // let linkSortByDateUpdated = url.format({
    //   pathname: '/records',
    //   query: newQuery,
    // })

    res.render('records', {
      filteredRecords,
      hasFilters,
      selectedFilters,
      linkSortByName: createSortLink("lastName"),
      linkSortByDateUpdated: createSortLink("dateUpdated")
    })
  })

}
