const faker = require('faker')

const statusesWithoutTRNs = [
  "Draft",
  "Apply enrolled",
  "Pending TRN",
  ]

module.exports = status => {

  let trn

  if (!statusesWithoutTRNs.includes(status)){
    trn = faker.random.number({
      'min': 1000000,
      'max': 9999999
    })
  }

  return trn
}
