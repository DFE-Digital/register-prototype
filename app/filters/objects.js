// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _ = require('lodash');

// Leave this filters line
var filters = {}

// Combine objects without mutating original
filters.mergeObjects = (...items) => {
  return Object.assign({}, ...items)
}

filters.isObject = item => {
  return _.isObject(item)
}

/*
  ====================================================================
  objectArrayToArray
  --------------------------------------------------------------------
  Flatten object array to nested array, keeping just the values
  ====================================================================

  Input:

  array = [
    {
      firstName: "Foo",
      lastName: "Bar"
    },{
      firstName: "Zip",
      lastName: "Buz"
    }
  ]

  Output:

  [
    ["Foo", "Bar"],
    ["Zip", "Buz"]
  ]

*/

filters.objectArrayToArray = array => {
  let newArray = []
  array.forEach(item => {
    let newItem = []
    Object.keys(item).forEach(part => {
      newItem.push(item[part])
    })
    newArray.push(newItem)
  })
  return newArray
}

filters.objectToArray = object => {
  if (!object) return []
  let newArray = []
  Object.keys(object).forEach(key => {
    newArray.push(object[key])
  })
  return newArray
}

// Keep only whitelisted keys from object or array of objects
filters.keepAttributes = (array, keysToKeep) => {
  const keepKeys = theObject => {
    let newObj = {}
    // Re-orders and keeps only selected keys

    // Coerce string to array
    if (_.isString(keysToKeep)) keysToKeep = [keysToKeep]


    keysToKeep.forEach(key => {
      let objectKeys = Object.keys(theObject)
      if (objectKeys.includes(key)){
        newObj[key] = theObject[key]
      }
    })
    return newObj
  }
  // Array of objects
  if (_.isArray(array)){
    return array.map(keepKeys)
  }
  // Single object
  else return keepKeys(array)
}

// set attribute on object
filters.setAttribute = (dictionary, key, value) => {
  var newDictionary = Object.assign({}, dictionary);
  newDictionary[key] = value;
  return newDictionary;
}

// Aet attribute on object (or array of objects)
filters.addAttribute = (dictionary, key, value) => {
  if (Array.isArray(dictionary)){
    newArr = []
    dictionary.forEach(item => {
      var newItem = Object.assign({}, item)
      newItem[key] = value
      newArr.push(newItem)
    })
    return newArr
  }
  else {
    var newDictionary = Object.assign({}, dictionary);
    newDictionary[key] = value;
    return newDictionary;
  }
}

// Clear a single attribute
filters.clearAttribute = (dictionary, key) => {
  var newDictionary = Object.assign({}, dictionary);
  newDictionary[key] = '';
  return newDictionary;
}

// Rename a key on an object, preserving key order
filters.renameAttribute = (dictionary, oldKey, newKey) => {
  const keys = Object.keys(dictionary)
  const newObj = keys.reduce((acc, val)=>{
    if(val === oldKey){
        acc[newKey] = dictionary[oldKey]
    }
    else {
        acc[val] = dictionary[val]
    }
    return acc
  }, {})

  return newObj
};

// Delete a single attribute
filters.deleteAttribute = (dictionary, key) => {
  // Don't modify the original
  var newDictionary = Object.assign({}, dictionary)
  delete newDictionary[key]
  return newDictionary
}

// Delete a keys with blank values
filters.deleteBlankAttributes = (dictionary) => {
  // Don't modify the original
  var newDictionary = Object.assign({}, dictionary)
  var keys = Object.keys(newDictionary)
  keys.forEach(key => {
    if (newDictionary[key] == ""){
      delete newDictionary[key]
    }
  })
  return newDictionary;
}

// Filter results for only those containing attribute and value
filters.where = (arr, key, compare) => {
  compare = [].concat(compare) // force to arr
  let filtered = arr.filter(item => {
    return compare.includes(item[key])
  })
  return filtered
}

// Remove items with a specified attribute and value
filters.removeWhere = (arr, key, compare) => {
  compare = [].concat(compare) // force to arr
  let filtered = arr.filter(item => {
    return !compare.includes(item[key])
  })
  return filtered
}
// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters
