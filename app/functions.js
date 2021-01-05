const fs = require('fs')
const path = require('path')
const individualFunctionsFolder = path.join(__dirname, './functions')
const moment = require("moment");
const _ = require('lodash');

module.exports = function (env) {


  var functions = {}

  // Import functions from functions folder
  if (fs.existsSync(individualFunctionsFolder)) {
    var files = fs.readdirSync(individualFunctionsFolder)
    files.forEach(file => {
      let fileData = require(path.join(individualFunctionsFolder, file))
      // Loop through each exported function in file (likely just one)
      Object.keys(fileData).forEach((functionGroup) => {
        // Get each method from the file
        Object.keys(fileData[functionGroup]).forEach(functionName => {
          functions[functionName] = fileData[functionGroup][functionName]
        })
      })
    })
  }

  // Return today’s date
  functions.today = function() {
    return moment().format('YYYY-MM-DD')
  }

  // Get the context - useful for logging
  functions.getContext = function() {
    return this.ctx
  }

  // Expose all of lodash
  functions.lodash = _


  // Config - set upstream variables
  // Function adapted from:
  // https://github.com/LotusTM/Kotsu/blob/4558ca79c58eadb14554e92deb68b276855d4502/modules/nunjucks-extensions.js#L66
  // see also https://github.com/mozilla/nunjucks/issues/406#issuecomment-227579804

  // This allows child templates to override values set by parent templates
  functions.config = function (prop, value, merge = true) {
    const ctxValue = _.get(this.ctx, prop)

    // Get current contenxt value if no `value` provided
    if (value === undefined) return ctxValue

    if (!merge || !ctxValue) {
      _.set(this.ctx, prop, value)
      return
    }

    // If this isn't Object, nothing we can do here, exit without changes to context
    if (typeof value !== 'object') return

    // Shallow cloning prevents leaking when merging
    value = (_.isArray(value) && _.union([], value, ctxValue)) || _.merge({}, value, ctxValue)

    _.set(this.ctx, prop, value)
  }

  /* ------------------------------------------------------------------
    keep the following line to return your functions to the app
  ------------------------------------------------------------------ */
  return functions
}
