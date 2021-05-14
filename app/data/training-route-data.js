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

// These sections should have a default status of 'review'
// rather than 'not started'
let applyReviewSections = [
  'personalDetails',
  'contactDetails',
  'diversity',
  'degree',
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
    'degree',
    'placement',
    'finance'
  ],
  initiatives: [
    "Transition to teach",
    "Now teach"
  ],
  bursariesAvailable: true
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
    ],
    bursariesAvailable: false
  },
  "Provider-led (postgrad)": {
    defaultEnabled: true,
    hasAllocatedPlaces: true,
    initiatives: [
      "Transition to teach",
      "Now teach",
      "Maths and physics chairs programme / Researchers in schools"
    ]
  },
  "School direct (salaried)": {
    defaultEnabled: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'degree',
      'schools',
      'placement',
      'finance'
    ],
    fields: [
      "leadSchool",
      "employingSchool"
    ],
    initiatives: [
      "Future Teaching Scholars",
      "Transition to teach",
      "Now teach"
    ],
    bursariesAvailable: false
  },
  "School direct (tuition fee)": {
    defaultEnabled: true,
    hasAllocatedPlaces: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'degree',
      'schools',
      'placement',
      'finance'
    ],
    fields: [
      "leadSchool",
    ],
    initiatives: [
      "Transition to teach",
      "Now teach",
      "Maths and physics chairs programme / Researchers in schools"
    ]
  },
  "Teach first (postgrad)": {},
  "Apprenticeship (postgrad)": {
    bursariesAvailable: false
  },
  "Opt-in undergrad": {},
  "Early years (graduate placement)": {
    defaultEnabled: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'degree',
      'placement',
      'finance'
    ],
    fields: [
      "employingSchool"
    ],
    qualifications: [
      "EYTS"
    ],
    qualificationsSummary: "EYTS full time",
    bursariesAvailable: false
  },
  "Early years (graduate entry)": {
    defaultEnabled: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'degree',
      'placement',
      'finance'
    ],
    qualifications: [
      "EYTS"
    ],
    qualificationsSummary: "EYTS full time"
  },
  "Early years (assessment only)": {
    defaultEnabled: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'degree',
      'finance'
    ],
    qualifications: [
      "EYTS"
    ],
    qualificationsSummary: "EYTS full time",
    bursariesAvailable: false
  },
  "Early years (undergrad)": {
    defaultEnabled: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'undergraduateQualification',
      'placement',
      'finance'
    ],
    qualifications: [
      "EYTS"
    ],
    qualificationsSummary: "EYTS full time",
    bursariesAvailable: false
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

// Count initiatives
let allInitiatives = []
Object.keys(trainingRoutes).forEach(routeName => {
  let initiatives = trainingRoutes[routeName]?.initiatives || []
  allInitiatives = allInitiatives.concat(initiatives)
})

allInitiatives = [...new Set(allInitiatives)]

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
      "3 to 7", // 6.51%
      "3 to 11", // 9.76%
      "5 to 11", // 40.97%
    ]
  },
  "Middle": {
    "hint": "ages 7 to 14",
    "ageRanges": null
  },
  "Secondary": {
    "hint": "ages 11 to 19",
    "ageRanges": [
      "11 to 16", // 26.42%
      "11 to 19", // 13.8%
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
  allInitiatives,
  trainingRoutes,
  allocatedSubjects,
  enabledTrainingRoutes,
  levels,
  defaultSections: defaultRouteData.sections,
  applyRoutes,
  publishRoutes,
  nonPublishRoutes,
  applyReviewSections
}
