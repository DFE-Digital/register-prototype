const faker = require('faker')
const weighted = require('weighted')
const trainingRouteData = require('../training-route-data')

module.exports = application => {

  if (application.status == "Draft") return "Manual"

  else {
    if (trainingRouteData.applyRoutes.includes(application.route)){
      return weighted.select({
        "Manual": 0.2,
        "Apply": 0.7
      })
    }
    else return "Manual"
  }


}
