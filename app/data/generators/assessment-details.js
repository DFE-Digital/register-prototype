const moment = require('moment')

module.exports = (faker, personalDetails) => {

  const ageRange = faker.helpers.randomize([
    "2 - 4 years",
    "5 - 11 years",
    "12 - 17 years"
  ])

  const subject = faker.helpers.randomize([
    "English",
    "Maths",
    "Physics",
    "Chemistry"])

  const startDate = faker.date.between('2017-01-01', '2020-08-01')
  const duration = faker.helpers.randomize([1,2,3])
  const endDate = moment(startDate).add(duration, 'years')

  return {
    ageRange,
    subject,
    startDate,
    duration,
    endDate
  }
}
