// These get applied to all routes unless overridden
let defaultRouteData = {
  defaultEnabled: false,
  qualifications: [
    "QTS"
  ],
  qualificationSummary: "QTS",
  duration: 1,
  sections: [
    'trainingDetails',
    'programmeDetails',
    'personalDetails',
    'contactDetails',
    'placement',
    'diversity',
    'degree'
  ]
}

let baseRouteData = {
  "Assessment only PG": {
    defaultEnabled: true,
    sections: [
      'trainingDetails',
      'programmeDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'degree'
    ]
  },
  "Provider-led PG": {
    defaultEnabled: true,
    hasAllocatedPlaces: true,
  },
  "School Direct (salaried)": {
    defaultEnabled: true
  },
  "School Direct (tuition fee)": {
    defaultEnabled: true
  },
  "Teach first PG": {},
  "Apprenticeship PG": {},
  "Assessment only UG": {},
  "Opt in undergraduate": {},
  "Early years - grad emp": {
    qualifications: [
      "EYTS"
    ],
    qualificationSummary: "EYTS full time"
  },
  "Early years - grad entry": {
    qualifications: [
      "EYTS"
    ],
    qualificationSummary: "EYTS full time"
  },
  "Early years - assessment only": {
    qualifications: [
      "EYTS"
    ],
    qualificationSummary: "EYTS full time"
  },
  "Early years - undergraduate": {
    defaultEnabled: true,
    qualifications: [
      "EYTS"
    ],
    qualificationSummary: "EYTS full time"
  }
}

let trainingRoutes = {}

// Combine route data
Object.keys(baseRouteData).sort().forEach(routeName => {
  let tempRoute = Object.assign({}, defaultRouteData, baseRouteData[routeName])
  tempRoute.name = routeName
  trainingRoutes[routeName] = tempRoute
})

let enabledTrainingRoutes = Object.values(trainingRoutes).filter(route => route.defaultEnabled == true).map(route => route.name)

let allocatedSubjects = [
  "Physical education"
]

let levels = {
  "Early years": {
    "hint": "ages 0 to 5",
    "ageRanges": null
  },
  "Primary": {
    "hint": "ages 3 to 11",
    "ageRanges": [
      "3 to 7 programme", // 6.51%
      "3 to 11 programme", // 9.76%
      "5 to 11 programme", // 40.97%
    ]
  },
  "Middle": {
    "hint": "ages 7 to 14",
    "ageRanges": null
  },
  "Secondary": {
    "hint": "ages 11 to 19",
    "ageRanges": [
      "11 to 16 programme", // 26.42%
      "11 to 19 programme", // 13.8%
    ]
  }
}

let publishRoutes = [
  'School direct salaried',
  'School direct tuition fee',
  'Apprenticeship PG',
  'Provider-led'
]

let nonPublishRoutes = [
  'Provider-led',
  'Assessment only',
  'Teach first PG',
  // 'Early years - grad emp',
  'Early years - grad entry',
  // 'Early years - assessment only',
  'Early years - undergraduate',
  'Opt in undergraduate'
]

// remainingAgeRanges = [
//   "0 to 5 programme", // 0.99%
//   "5 to 14 programme", // 0.01%
//   "7 to 16 programme", // 0.01%
//   "9 to 14 programme", // 0.01%
//   "9 to 16 programme", // 0.01%
//   // primary
//   "3 to 8 programme", // 0.02%
//   "3 to 9 programme", // 0.08%
//   "5 to 9 programme", // 0.14%
//   "7 to 11 programme", // 0.76%
//   // middle
//   "7 to 14 programme", // 0.12%
//   // secondary
//   "14 to 19 programme", // 0.36%
//   "14 to 19 diploma" // 0.03%
// ]


module.exports = {
  trainingRoutes,
  allocatedSubjects,
  enabledTrainingRoutes,
  levels,
  defaultSections: defaultRouteData.sections,
  publishRoutes,
  nonPublishRoutes
}
