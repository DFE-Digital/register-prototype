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
        "type": "Bachelor of Science",
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

// Partially complete apply draft with one piece of invalid data, course is eligible for a bursary
seedRecords.push({
  status: 'Apply draft',
  personalDetails: {
    givenName: "Samantha",
    familyName: "Koch",
    sex: 'Female'
  },
  source: "Apply",
  applyData: {
    recruitedDate: "2021-05-23T18:24:34.886Z",
    applicationDate: "2021-04-10T18:17:24.509Z"
  },
  "updatedDate": "2021-06-13T19:28:56.667Z",
  route: 'Provider-led (postgrad)',
  "courseDetails": {
    "ageRange": "11 to 19",
    "code": "P369",
    "duration": 1,
    "endDate": "2022-05-31T23:00:00.000Z",
    "id": "f6f63798-910c-4174-8f72-3eed1c6cb2f9",
    "isPublishCourse": true,
    "level": "Secondary",
    "qualifications": [
      "QTS",
      "PGCE"
    ],
    "qualificationsSummary": "PGCE with QTS full time",
    "route": "Provider-led (postgrad)",
    "startDate": "2021-08-31T23:00:00.000Z",
    "studyMode": "Full time",
    "courseNameLong": "Mathematics (X348)",
    "courseNameShort": "Mathematics",
    "publishSubjects": {
      first: "Mathematics"
    },
    "subjects": {
      first: null
    }
  },
  degree: {
    "items": [
      {
        "isInternational": "false",
        "org": "Brunel University London",
        "subject": "Mathematics",
        "endDate": "2014",
        "id": "a24f59d5-7e0c-4ee5-b7db-f0d192c6fe05",
        "type": "Bachelor of Science",
        "grade": "First-class honours"
      },
      {
        "type": "**invalid**Masters",
        "subject": "Civil engineering",
        "isInternational": "false",
        "org": "Heythrop College",
        "country": "United Kingdom",
        "grade": "Distinction",
        "predicted": false,
        "startDate": "2012",
        "endDate": "2016",
        "id": "0c79cba8-cdc3-431d-96f2-62f59855cb97"
      }
    ]
  },
  trainingDetails: null,
  funding: null,
  invalidAllowed: false
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
  route: 'School direct (salaried)',
  "trainingDetails": {
    // "traineeStarted": "true",
    "traineeId": "2020/21-053",
    "status": [
      "Completed"
    ]
  },
  courseDetails: {
    "isPublishCourse" : true,
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
  schools: {
    status: 'Completed'
  },
  placement: {
    status: 'Completed'
  },
  funding: {
    status: 'Completed'
  }
})

seedRecords.push({
  status: 'Apply draft',
  personalDetails: {
    givenName: "Rachel",
    familyName: "Laverty",
    sex: 'Female',
    status: 'Completed'
  },
  route: 'Provider-led (postgrad)',
  trainingDetails: {
    "traineeStarted": "true",
    "traineeId": "2020/21-085",
    status: [
      "Completed"
    ]
  },
  source: "Apply",
  applyData: {
    recruitedDate: "2021-05-23T18:24:34.886Z",
    applicationDate: "2021-04-10T18:17:24.509Z",
    status: "Completed"
  },
  courseDetails: {
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
  placement: {
    status: 'Completed'
  },
  funding: {
    status: 'Completed'
  }
})

seedRecords.push({
  status: 'Draft',
  personalDetails: {
    givenName: "George",
    familyName: "Briggs",
    sex: 'Male',
    status: 'Completed'
  },
  route: 'Provider-led (postgrad)',
  trainingDetails: {
    "traineeStarted": "true",
    "traineeId": "2020/21-102",
    status: [
      "Completed"
    ]
  },
  courseDetails: {
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
  placement: {
    status: 'Completed'
  },
  funding: {
    status: 'Completed'
  }
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

seedRecords.push({
  status: "TRN received",
  trainingDetails: {
    traineeId: "2020/21-092"
  },
  route: 'Early years (postgrad)',
  courseDetails: {
    isPublishCourse: false
  },
  submittedDate: "2020-05-28T12:37:21.384Z",
  updatedDate: "2020-07-15T04:26:19.269Z",
  trn: 7785421,
  personalDetails: {
    givenName: "Delia",
    familyName: "Klein",
    sex: "Female"
  },
  "placement": {
    "items": [
      {
        "location": "Sacred Heart Newcastle SCITT",
        "startMonth": "1",
        "duration": "2",
        "id": "cd8d959f-a246-4402-b2c8-e1bbb9e1fc48"
      },
      {
        "location": "University of Wales Trinity Saint David (UWTSD Swansea)",
        "startMonth": "5",
        "duration": "12",
        "id": "29477b76-3f2e-4571-bb5f-7e62a2fb994a"
      }
    ],
  }
})

module.exports = seedRecords
