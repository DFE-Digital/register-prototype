module.exports = (faker) => {
  return faker.helpers.randomize([
    // 'Deferred',
    'Draft',
    'Pending TRN',
    'TRN received',
    'QTS recommended',
    'QTS awarded',
    'Deferred',
    'Withdrawn'
  ])
}
