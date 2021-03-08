// A non-exhaustive list of routes
// Publish and non publish can overlap

let applyRoutes = [
  'Provider-led (postgrad)',
  'School direct (salaried)',
  'School direct (tuition fee)',
]

// Not all these routes will be enabled
let publishRoutes = [
  'Apprenticeship (postgrad)',
  'Provider-led (postgrad)',
  'Provider-led (undergrad)',
  'School direct (salaried)',
  'School direct (tuition fee)',
  'Teaching apprenticeship',
]

let nonPublishRoutes = [
  'Provider-led (postgrad)',
  'Provider-led (undergrad)',
  'Assessment only',
  'Teach First (postgrad)',
  'Early years (graduate placement)',
  'Early years (graduate entry)',
  'Early years (assessment only)',
  'Early years (undergrad)',
  'Opt-in (undergrad)'
]

// Create array of unique values
let allRoutesArray = [...new Set([...publishRoutes, ...nonPublishRoutes])].sort()
let allRoutes = {}

// Add detail about publish or non publish
allRoutesArray.forEach(route => {
  allRoutes[route] = {
    isPublishRoute: publishRoutes.includes(route),
    isNonPublishRoute: nonPublishRoutes.includes(route)
  }
})


// Sensible defaults for route data
let defaultRouteData = {
  defaultEnabled: false,
  qualifications: [
    "QTS"
  ],
  qualificationsSummary: "QTS",
  duration: 1,
  sections: [
    'trainingDetails',
    'courseDetails',
    'personalDetails',
    'contactDetails',
    'placement',
    'diversity',
    'degree'
  ]
}

// Data for each route
let baseRouteData = {
  "Assessment only": {
    defaultEnabled: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'degree'
    ]
  },
  "Provider-led (postgrad)": {
    defaultEnabled: true,
    hasAllocatedPlaces: true,
  },
  "School direct (salaried)": {
    defaultEnabled: true
  },
  "School direct (tuition fee)": {
    defaultEnabled: true
  },
  "Teach first (postgrad)": {},
  "Apprenticeship (postgrad)": {},
  "Opt-in undergrad": {},
  "Early years (graduate placement)": {
    qualifications: [
      "EYTS"
    ],
    qualificationsSummary: "EYTS full time"
  },
  "Early years (graduate entry)": {
    qualifications: [
      "EYTS"
    ],
    qualificationsSummary: "EYTS full time"
  },
  "Early years (assessment only)": {
    qualifications: [
      "EYTS"
    ],
    qualificationsSummary: "EYTS full time"
  },
  "Early years (undergrad)": {
    defaultEnabled: true,
    qualifications: [
      "EYTS"
    ],
    qualificationsSummary: "EYTS full time"
  }
}

let trainingRoutes = {}


// Combine route data
Object.keys(allRoutes).forEach(routeName => {
  let routeData = Object.assign({}, defaultRouteData, allRoutes[routeName], baseRouteData[routeName])
  routeData.name = routeName
  trainingRoutes[routeName] = routeData
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
  allRoutes: allRoutesArray,
  trainingRoutes,
  allocatedSubjects,
  enabledTrainingRoutes,
  levels,
  defaultSections: defaultRouteData.sections,
  applyRoutes,
  publishRoutes,
  nonPublishRoutes
}
