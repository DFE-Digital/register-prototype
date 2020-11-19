let seedRecords = []

// Very detailed draft for use in user research
seedRecords.push({
  "status": "Draft",
  "events": {
    "items": []
  },
  "route": "Provider-led",
  "trainingDetails": {
    "traineeStarted": "false",
    "traineeId": "2020/21-053",
    "status": [
      "Completed"
    ]
  },
  "programmeDetails": {
    "isPublishCourse" : false,
    "subject": "Physical education",
    "ageRange": "14 - 19 programme",
    "startDate": [
      "3",
      "10",
      "2021"
    ],
    "endDate": [
      "10",
      "06",
      "2024"
    ],
    "allocatedPlace": "Yes",
    "status": [
      "Completed"
    ]
  },
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
    "sex": "Female",
    "status": [
      "Completed"
    ]
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
        "type": "Bachelor degree"
      },
      {
        "isInternational": "false",
        "subject": "Sport and exercise sciences",
        "org": "The University of Manchester",
        "endDate": "2016",
        "type": "BSc - Bachelor of Science",
        "grade": "First-class honours"
      }
    ],
    "status": [
      "Completed"
    ]
  }
})

// Static names for ur
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
  submittedDate: "2020-05-28T12:37:21.384Z",
  updatedDate: "2020-07-15T04:26:19.269Z",
  trn: 8694898,
  personalDetails: {
    givenName: "Martin",
    familyName: "Cable",
    sex: "Male"
  },
})

// console.log({seedRecords})
module.exports = seedRecords
