module.exports = (faker) => {
  return faker.helpers.randomize([
    // 'Deferred',
    'Draft',
    'Submitted',
    'TRN received',
    'Withdrawn',
    'QTS complete'
  ])
}
