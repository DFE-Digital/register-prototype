const faker = require('faker')
const moment            = require('moment')


module.exports = application => {
  return {
    recruitedDate: application.submittedDate,
    applicationDate: faker.date.between(
      moment(application.submittedDate),
      moment(application.submittedDate).subtract(60, 'days')
    )
  }
}

