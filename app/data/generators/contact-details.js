module.exports = (faker, personalDetails) => {
  let address, internationalAddress = undefined
  let county = undefined // faker.address.county()

  if (personalDetails.isInternationalTrainee) {
    faker.locale = 'fr'
    internationalAddress = `${faker.address.streetAddress()}
${faker.address.city()}
${faker.address.state()}
${faker.address.zipCode()}`
  } 
  else {
    faker.locale = 'en_GB'
    
    address = {
      line1: faker.address.streetAddress(),
      line2: '',
      level2: faker.address.city(),
      level1: personalDetails.isInternationalTrainee ? faker.address.state() : county,
      postcode: faker.address.zipCode(),
      ...(personalDetails.isInternationalTrainee && { country: 'France' })
    }
  }

  return {
    phoneNumber: faker.phone.phoneNumber(),
    email: faker.internet.email(personalDetails.givenName, personalDetails.familyName).toLowerCase(),
    address,
    internationalAddress,
    addressType: (personalDetails.isInternationalTrainee) ? 'international' : 'domestic'
  }
}
