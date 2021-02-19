let defaultSections = [
  // 'recordSetup',
  'trainingDetails',
  'programmeDetails',
  'personalDetails',
  'placement',
  'contactDetails',
  'diversity',
  'degree'
]

let mainTrainingRoutes = {
  "Assessment only": {
    name: "Assessment only",
    defaultEnabled: true,
    sections: [
      // 'recordSetup',
      'trainingDetails',
      'programmeDetails',
      'personalDetails',
      'placement',
      'contactDetails',
      'diversity',
      'degree'
    ]
  },
  "Provider-led": {
    name: "Provider-led",
    defaultEnabled: true,
    hasAllocatedPlaces: true,
    sections: [
      // 'recordSetup',
      'trainingDetails',
      'programmeDetails',
      'personalDetails',
      'placement',
      'contactDetails',
      'diversity',
      'degree'
    ],
    fields: [
      'programmeEndDate',
    ]
  }
}

let extraRoutes = [
  "Teach first PG",
  "Early years - grad emp",
  "Early years - grad entry",
  "Early years - assessment only",
  "Early years - undergraduate",
  "School direct salaried",
  "School direct tuition fee",
  "Apprenticeship PG",
  "Opt in undergraduate"
]

let trainingRoutes = Object.assign({}, mainTrainingRoutes)

extraRoutes.forEach(route => {
  trainingRoutes[route] = {
    name: route,
    defaultEnabled: false,
    hasAllocatedPlaces: true,
    sections: [
      // 'recordSetup',
      'trainingDetails',
      'programmeDetails',
      'personalDetails',
      'placement',
      'contactDetails',
      'diversity',
      'degree'
    ]
  }
})

// Sort alphabetically
const orderedTrainingRoutes = {}
Object.keys(trainingRoutes).sort().forEach(function(key) {
  orderedTrainingRoutes[key] = trainingRoutes[key];
});

trainingRoutes = orderedTrainingRoutes

allocatedSubjects = [
  "Physical education"
]

let enabledTrainingRoutes = Object.values(trainingRoutes).filter(route => route.defaultEnabled == true).map(route => route.name)

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
  // 'Early years - grad amp',
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
  defaultSections,
  publishRoutes,
  nonPublishRoutes
}
