module.exports = (faker, personalDetails) => {
  if (personalDetails.isInternationalCandidate) {
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
      level1: personalDetails.isInternationalCandidate ? faker.address.state() : faker.address.county(),
      postcode: faker.address.zipCode(),
      ...(personalDetails.isInternationalCandidate && { country: 'France' })
    },
    addressType: (personalDetails.isInternationalCandidate) ? 'international' : 'domestic'
  }
}
