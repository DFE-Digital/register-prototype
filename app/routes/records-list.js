const url = require('url')
const _ = require('lodash')

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

    let query = Object.assign({}, req.query)

    // Clean up radio and checkbox data
    if (query.filterStatus) query.filterStatus = cleanInputData(query.filterStatus)
    if (query.filterCycle) query.filterCycle = cleanInputData(query.filterCycle)
    if (query.filterTrainingRoutes) query.filterTrainingRoutes = cleanInputData(query.filterTrainingRoutes)

    let { filterStatus, searchQuery, filterSubject, filterCycle, filterTrainingRoutes } = query

    const hasFilters = !!(filterStatus) || !!(searchQuery) || !!(filterSubject && filterSubject != 'All subjects') || !!(filterCycle) || !!(filterTrainingRoutes)

    let filteredRecords = data.records

    // Only show records for training routes that are enabled
    let enabledTrainingRoutes = data.settings.enabledTrainingRoutes
    filteredRecords = filteredRecords.filter(record => enabledTrainingRoutes.includes(record.route) || (record.route == undefined))

    // Search traineeId and full name
    if (searchQuery){
      filteredRecords = filteredRecords.filter(record => {
        let recordIdMatch = (searchQuery) ? (record?.trainingDetails?.traineeId.toLowerCase().includes(searchQuery.toLowerCase())) : false
        let nameMatch = false

        let fullName = _.get(record, "personalDetails.fullName")
        // Draft records might not have a full name
        fullName = (fullName) ? fullName : ""

        // Split query in to parts
        let searchParts = searchQuery.split(' ')
       
        // Check that each part exists in the trainee's name
        nameMatch = true
        searchParts.forEach(part => {
          if (!fullName.toLowerCase().includes(part.toLowerCase())) {
            nameMatch = false
          }
        })
        return recordIdMatch || nameMatch
      })
    }

    // Cycle not implimented yet
    // if (filterCycle){
    //   filteredRecords = filteredRecords.filter(record => filterCycle.includes(record.cycle))
    // }

    if (filterTrainingRoutes){
      filteredRecords = filteredRecords.filter(record => filterTrainingRoutes.includes(record.route))
    }

    if (filterStatus){
      filteredRecords = filteredRecords.filter(record => filterStatus.includes(record.status))
    }

    if (filterSubject && filterSubject != "All subjects"){
      filteredRecords = filteredRecords.filter(record => record.programmeDetails.subject == filterSubject)
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

      if (filterCycle) {
        selectedFilters.categories.push({
          heading: { text: 'Cycle' },
          items: filterCycle.map((cycle) => {

            let newQuery = Object.assign({}, query)
            newQuery.filterCycle = newQuery.filterCycle.filter(a => a != cycle)
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

      if (filterTrainingRoutes) {
        selectedFilters.categories.push({
          heading: { text: 'Training route' },
          items: filterTrainingRoutes.map((route) => {

            let newQuery = Object.assign({}, query)
            newQuery.filterTrainingRoutes = newQuery.filterTrainingRoutes.filter(a => a != route)

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

      if (filterStatus) {
        selectedFilters.categories.push({
          heading: { text: 'Status' },
          items: filterStatus.map((status) => {

            let newQuery = Object.assign({}, query)
            newQuery.filterStatus = newQuery.filterStatus.filter(a => a != status)

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

      if (filterSubject && filterSubject != 'All subjects') {
        let newQuery = Object.assign({}, query)
        delete newQuery.filterSubject
        selectedFilters.categories.push({
          heading: { text: "Subject" },
          items: [{
            text: filterSubject,
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
