const moment = require('moment')
const weighted = require('weighted')


module.exports = (faker, status) => {

  // const ageRange = faker.helpers.randomize([
  //   "2 - 4 years",
  //   "5 - 11 years",
  //   "12 - 17 years"
  // ])

  const ageRanges = {
    "one": "5 - 11 Programme",
    "two": "11 - 16 Programme",
    "three": "11 - 18 Programme",
    "four": "3 - 11 Programme",
    "five": "3 - 7 Programme"
  }

  const selectedAgeRange = weighted.select({
    one: 0.41,
    two: 0.26,
    three: 0.14,
    four: 0.1,
    five: 0.09
  })

  const ageRange = ageRanges[selectedAgeRange]

  const subject = faker.helpers.randomize([
    "English",
    "Maths",
    "Physics",
    "Chemistry"])

  const statusesWithEndDates = [
    "QTS recommended",
    "QTS awarded"
  ]

  const startDate = faker.date.between('2017-01-01', '2020-08-01')
  const duration = faker.helpers.randomize([1,2,3])
  const endDate = (statusesWithEndDates.includes(status)) ? moment(startDate).add(duration, 'years') : undefined

  return {
    ageRange,
    subject,
    startDate,
    duration,
    endDate
  }
}


// Age range options (only top 5 used - which make up majority)
// "0 - 5 Programme",
// "3 - 7 Programme",
// "3 - 8 Programme",
// "3 - 9 Programme",
// "3 - 11 Programme",
// "5 - 9 Programme",
// "5 - 11 Programme",
// "5 - 14 Programme",
// "7 - 11 Programme",
// "7 - 14 Programme",
// "7 - 16 Programme",
// "9 - 14 Programme",
// "9 - 16 Programme",
// "11 - 16 Programme",
// "11 - 19 Programme",
// "14 - 19 Programme",
// "14 - 19 Diploma",
