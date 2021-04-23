const faker = require('faker')

const statusesWithoutTRNs = [
  "Draft",
  "Apply draft",
  "Pending TRN",
  ]

module.exports = application => {

  let trn

  if (!statusesWithoutTRNs.includes(application.status)){
    trn = faker.random.number({
      'min': 1000000,
      'max': 9999999
    })
  }

  return trn
}
