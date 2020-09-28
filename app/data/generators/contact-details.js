module.exports = (faker, personalDetails) => {
  if (personalDetails.isInternationalTrainee) {
    faker.locale = 'fr'
  } else {
    faker.locale = 'en_GB'
  }

  return {
    phoneNumber: faker.phone.phoneNumber(),
    email: faker.internet.email(personalDetails.givenName, personalDetails.familyName).toLowerCase(),
    address: {
      line1: faker.address.streetAddress(),
      line2: '',
      level2: faker.address.city(),
      level1: personalDetails.isInternationalTrainee ? faker.address.state() : faker.address.county(),
      postcode: faker.address.zipCode(),
      ...(personalDetails.isInternationalTrainee && { country: 'France' })
    },
    addressType: (personalDetails.isInternationalTrainee) ? 'international' : 'domestic'
  }
}
