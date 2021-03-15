const faker   = require('faker')
const weighted = require('weighted')
const degreeData = require('../degree')

module.exports = (isInternationalTrainee) => {
  const item = (faker) => {
    const subject = faker.helpers.randomize(degreeData().subjects)
    const predicted = faker.random.boolean()
    const endDate = faker.helpers.randomize(['2020','2019','2018','2017','2016','2015'])
    const startDate = (parseInt(endDate) - 4).toString()
    const id = faker.random.uuid()

    if (isInternationalTrainee) {
      return {
        // type: 'Diplôme',
        type: 'Bachelor degree', // ENIC equivalent
        subject,
        isInternational: "true",
        org: 'University of Paris',
        country: 'France',
        // grade: 'Pass',
        predicted,
        enic: { // ENIC key not used? probably copied from Manage
          reference: '4000228363',
          comparable: 'Bachelor degree'
        },
        startDate,
        endDate,
        id
      }
    } else {
      const type = faker.helpers.randomize(degreeData().types.all)
      const level = type.level
      const grade = faker.helpers.randomize([
        'First-class honours',
        'Upper second-class honours (2:1)',
        'Lower second-class honours (2:2)',
        'Third-class honours',
        'Pass',
        ...(level !== 6) ? ['Merit'] : [],
        ...(level !== 6) ? ['Distinction'] : [],
        ...(level !== 6) ? ['Not applicable'] : [],
        ...(level !== 6) ? ['Unknown'] : []
      ])

      return {
        type: type.text,
        subject,
        isInternational: "false",
        org: faker.helpers.randomize(degreeData().orgs),
        country: 'United Kingdom',
        grade,
        predicted,
        startDate,
        endDate,
        id
      }
    }
  }

  const count = weighted.select({
    1: 0.9,
    2: 0.1
  })
  const items = []
  for (var i = 0; i < count; i++) {
    items.push(item(faker))
  }

  // Trainees with multiple degrees must have a single degree selected for the
  // purposes of bursaries
  let degreeToBeUsedForBursaries
  if (items.length > 1){
    degreeToBeUsedForBursaries = faker.helpers.randomize(items).id
  }

  return {
    items: items,
    degreeToBeUsedForBursaries
  }
}
