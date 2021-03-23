const faker = require('faker')
const moment            = require('moment')

// Dates here a bit complex! In general makes updated date be after
// submitted date, and historic records likely to be updated near to the
// end of the accademic year.

module.exports = ({updatedDate, submittedDate, deferredDate, withdrawalDate, qualificationAwardedDate}, application) => {

  // console.log(params)
  // console.log(typeof updatedDate)
  // console.log(application.academicYear)
  // let updatedDate, submittedDate, deferredDate, withdrawalDate, qtsAwarded

  const yearStartDate = moment(`${application.academicYear}-08-01`).toDate()

  let yearEndDate = moment(yearStartDate).add(1, 'years').toDate()

  const isCurrentYear = ( moment(yearEndDate).isBefore()) ? false : true

  // Randomise end dates for AO
  if (application.route == 'Assessment only'){
    yearEndDate = faker.date.between(
      moment(yearStartDate).add(90, 'days'),
      moment(yearEndDate)
    )
  }

  if (!updatedDate) {

    if (submittedDate){
      // Updated date can’t be in the future
      let lastPossibleUpdatedDate = (moment(submittedDate).add(100, 'days').isAfter() ? moment() : submittedDate)

      updatedDate = faker.date.between(
        moment(submittedDate),
        moment(lastPossibleUpdatedDate)
      )
    }

    // Assume all drafts are recent
    if (application.status == 'Draft'){

      updatedDate = faker.date.between(
        moment(),
        moment().subtract(50, 'days')
      )
    }

    // Assume all pending are very recent
    else if (application.status == 'Pending TRN'){

      updatedDate = faker.date.between(
        moment(),
        moment().subtract(6, 'days')
      )
    }

    else {
      // Random date within accademic year
      // Todo: should we bias towards August?

      // Updated date can't be in future
      let lastPossibleUpdatedDate = (moment(yearEndDate).isAfter() ? moment() : yearEndDate)

      if (isCurrentYear) {
        updatedDate = faker.date.between(
          moment(yearStartDate),
          moment(lastPossibleUpdatedDate)
        )
      }

      else {
        // Historic entries are most likely updated near to the year end date
        updatedDate = faker.date.between(
          moment(yearEndDate).add(50, 'days'),
          moment(yearEndDate).subtract(50, 'days')
        )
      }

    }

  }

  // Submitted dates apply to everything except drafts
  if (!submittedDate && application.status != "Draft"){
    if (application.status == "Pending TRN"){
      submittedDate = updatedDate
    }
    else {
      submittedDate = faker.date.between(
        moment(yearStartDate).subtract(60, 'days'), // let applications start before the accademic year
        moment(updatedDate).subtract(50, 'days')
      )
    }
  }

  if (application.status === 'Deferred') {
    deferredDate = deferredDate || updatedDate
  }

  if (application.status === 'Withdrawn') {    
    // Make sure withdrawal date is the same as the last updated date
    withdrawalDate = withdrawalDate || updatedDate
  }

  if (application.status.includes('awarded')) {    
    // Make sure withdrawal date is the same as the last updated date
    qualificationAwardedDate = qualificationAwardedDate || updatedDate
  }

  // console.log({
  //   updatedDate,
  //   submittedDate,
  //   deferredDate,
  //   withdrawalDate,
  //   qtsAwardedDate
  // })

  // console.log("Deferred is:", typeof deferredDate)

  return {
    updatedDate,
    submittedDate,
    deferredDate,
    withdrawalDate,
    qualificationAwardedDate
  }
}
