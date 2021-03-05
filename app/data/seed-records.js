let seedRecords = []

// Very detailed draft for user research - matches seed data
seedRecords.push({
  "status": "Draft",
  "events": {
    "items": []
  },
  "route": "Provider-led (postgrad)",
  trainingDetails: null,
  courseDetails: null,
  "personalDetails": {
    "nationality": [
      "Irish",
      "American"
    ],
    "givenName": "Sarah Lilia",
    "middleNames": "",
    "familyName": "Jones",
    "dateOfBirth": [
      "3",
      "12",
      "1987"
    ],
    "sex": "Female"
  },
  "contactDetails": {
    "internationalAddress": "",
    "addressType": "domestic",
    "address": {
      "line1": "260 Bradford Street",
      "line2": "Deritend",
      "level2": "Birmingham",
      "postcode": "B12 0QY"
    },
    "phoneNumber": "07700 900941",
    "email": "s.jones@example.com",
    "status": [
      "Completed"
    ]
  },
  "diversity": {
    "diversityDisclosed": "true",
    "ethnicGroup": "White",
    "ethnicBackground": "Irish",
    "ethnicBackgroundOther": "",
    "disabledAnswer": "They shared that they’re disabled",
    "disabilities": [
      "Physical disability or mobility issue",
      "Social or communication impairment"
    ],
    "disabilitiesOther": "",
    "status": [
      "Completed"
    ]
  },
  "degree": {
    "items": [
      {
        "isInternational": "true",
        "subject": "Biology",
        "country": "United States",
        "endDate": "2013",
        "type": "Bachelor degree",
        "id": "31dc5e93-b521-425c-98d8-dec96eb2388c"
      },
      {
        "isInternational": "false",
        "subject": "Sport and exercise sciences",
        "org": "The University of Manchester",
        "endDate": "2016",
        "type": "BSc - Bachelor of Science",
        "grade": "First-class honours",
        "id": "1faf0ae6-4c01-4224-9e49-06beffc0c5d0"
      }
    ],
    "degreeToBeUsedForBursaries": "31dc5e93-b521-425c-98d8-dec96eb2388c",
    "status": [
      "Completed"
    ]
  },
  placement: null
})

// Partially complete draft
seedRecords.push({
  status: 'Draft',
  personalDetails: {
    givenName: "Samantha",
    familyName: "Koch",
    sex: 'Female',
    status: 'Completed'
  },
  route: 'Assessment only',
  trainingDetails: {
    status: 'Completed'
  },
  courseDetails: {
    status: 'Completed',
    isPublishCourse: false
  },
  contactDetails: null,
  diversity: null,
  degree: null
})

// Fully complete draft - ready to submit
seedRecords.push({
  status: 'Draft',
  personalDetails: {
    givenName: "Jill",
    familyName: "Bachmann",
    sex: 'Female',
    status: 'Completed'
  },
  route: 'Assessment only',
  "trainingDetails": {
    // "traineeStarted": "true",
    "traineeId": "2020/21-053",
    "status": [
      "Completed"
    ]
  },
  courseDetails: {
    "isPublishCourse" : false,
    status: 'Completed'
  },
  contactDetails: {
    status: 'Completed'
  },
  diversity: {
    status: 'Completed'
  },
  degree: {
    status: 'Completed'
  },
  placement: null
})

seedRecords.push({
  status: 'Pending TRN',
  submittedDate: new Date(),
  personalDetails: {
    givenName: "Becky",
    familyName: "Brothers",
    nationality: ["British"],
    sex: 'Female'
  },
  diversity: {
    "diversityDisclosed": "true",
    "ethnicGroup": "Black, African, Black British or Caribbean",
    "ethnicGroupSpecific": "Caribbean",
    "disabledAnswer": "Not provided"
  },
  route: 'Assessment only',
  courseDetails: {
    isPublishCourse: false
  }
})

seedRecords.push({
  status: "TRN received",
  trainingDetails: {
    traineeId: "2020/21-023"
  },
  submittedDate: "2020-05-28T12:37:21.384Z",
  updatedDate: "2020-08-04T04:26:19.269Z",
  trn: 8405624,
  route: 'Provider-led (postgrad)',
  courseDetails: {
    isPublishCourse: false
  },
  personalDetails: {
    givenName: "Bea",
    familyName: "Waite",
    sex: "Female",
    nationality: ["French"]
  },
})

seedRecords.push({
  status: "TRN received",
  trainingDetails: {
    traineeId: "2020/21-074"
  },
  submittedDate: "2020-06-28T12:37:21.384Z",
  updatedDate: "2020-07-04T04:26:19.269Z",
  trn: 8594837,
  route: 'Provider-led (postgrad)',
  courseDetails: {
    isPublishCourse: 'false'
  },
  personalDetails: {
    givenName: "Janine",
    familyName: "Newman",
    sex: "Female"
  },
})

seedRecords.push({
  status: "TRN received",
  trainingDetails: {
    traineeId: "2020/21-092"
  },
  route: 'Provider-led (postgrad)',
  courseDetails: {
    isPublishCourse: false
  },
  submittedDate: "2020-05-28T12:37:21.384Z",
  updatedDate: "2020-07-15T04:26:19.269Z",
  trn: 8694898,
  personalDetails: {
    givenName: "Martin",
    familyName: "Cable",
    sex: "Male"
  },
})

module.exports = seedRecords
