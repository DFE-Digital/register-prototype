const weighted = require('weighted')
const gceData = require('../gce')

module.exports = (faker, isInternationalTrainee) => {
  let year = faker.date.between('1970', '2016')
  year = year.getFullYear()

  const type = weighted.select({
    'A level': 0.9,
    'Scottish Highers': 0.1
  })

  let country = null

  if (isInternationalTrainee){
    country = faker.helpers.randomize(['France','Italy','Germany','Ireland'])
  }

  // GCSE grade values changed to numbers after 2017
  const singleGrades = gceData().singleGrades

  const subjects = gceData().subjects

  const item = (faker) => {
    const subject = faker.helpers.randomize(subjects)
    const startDate = '2017'
    const endDate = '2020'

    if (isInternationalTrainee) {
      return {
        type: 'Baccalauréat Général',
        subject,
        country,
        missing: weighted.select({
          'I will be taking an equivalency test on 18th August 2020': 0.2,
          false: 0.8
        }),
        enic: {
          reference: '4000228363',
          comparable: 'A level grades A*-C/9-4'
        },
        grade: 'Pass',
        endDate,
        startDate
      }
    } else {
      const grade = faker.helpers.randomize(singleGrades)

      return {
        type,
        subject,
        // org: faker.helpers.randomize(degreeData().orgs),
        country: 'United Kingdom',
        grade,
        // predicted,
        startDate,
        endDate
      }
    }
  }

  const count = weighted.select({
    3: 0.7,
    4: 0.2,
    5: 0.1
  })
  const items = []

  for (var i = 0; i < count; i++) {
    items.push(item(faker))
  }

  return items

}
