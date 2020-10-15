let mainTrainingRoutes = {
  "Assessment Only": {
    name: "Assessment Only",
    defaultEnabled: true,
    sections: [
      'programmeDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'degree'
    ]
  },
  "Provider-led": {
    name: "Provider-led",
    defaultEnabled: true,
    sections: [
      'programmeDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'degree'
    ]
  }
}


let extraRoutes = [
  "Teach first PG",
  "Early years - grad emp",
  "Early years - grad entry",
  "Early years - assessment only",
  "Early years undergraduate",
  "School Direct salaried",
  "School direct tuition fee",
  "Apprenticeship PG",
  "Opt in undergraduate"
]

let trainingRoutes = Object.assign({}, mainTrainingRoutes)

extraRoutes.forEach(route => {
  trainingRoutes[route] = {
    name: route,
    defaultEnabled: false,
    sections: [
      'programmeDetails',
      'personalDetails',
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

// console.log(trainingRoutes)

module.exports = orderedTrainingRoutes
