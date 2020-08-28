module.exports = (faker) => {
  return faker.helpers.randomize([
    // 'Deferred',
    'Incomplete',
    'Submitted',
    'TRN received',
    'Rejected',
    'QTS complete'
  ])
}
