// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const string = require('string')
const _ = require('lodash');
// Leave this filters line
var filters = {}


// Create url / slugs from text
// This is a heading => this-is-a-heading
filters.slugify = (input) => {
  if (!input) throw "Error in slugify: no input", input;
  else return string(input).slugify().toString();
}

// Hyphen separate a string
// This is a string => this-is-a-string
filters.kebabCase = (string) => {
  return string.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase()
}

// Sentence case - uppercase first latter
filters.sentenceCase = (input) => {
  if (!input) return '' // avoid printing false to client
  if (_.isString(input)){
    return input.charAt(0).toUpperCase() + input.slice(1);
  }
  else return input
}

// Is it a string or not?
filters.isString = str => {
  let isString = _.isString(str)
  return _.isString(str)
}

// Assessment only => an Assesment only
// Provider-led => a provider led
filters.prependWithAOrAn = string => {
  var vowelRegex = '^[aieouAIEOU].*'
  var matched = string.match(vowelRegex)
  if(matched){
    return `an ${string}`
  }
  else{
    return `a ${string}`
  }
}

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters
