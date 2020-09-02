// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const moment = require("moment");
var _ = require('lodash');

// Leave this filters line
var filters = {}

/*
  ====================================================================
  arrayToDateObject
  --------------------------------------------------------------------
  Convert array to javascript date object
  ====================================================================

  Usage:

  {{ [1,2,2020] | arrayToDateObject }}

  = 2020-02-01T00:00:00.000Z

*/

filters.arrayToDateObject = (array) => {
  return new Date(array[2], array[1] -1, array[0])
}

// Output date array - for use in design system macros macros
filters.toDateArray = (date) => {
  if (!date) return []
  if (_.isArray(date)) return date
  else {
    return [moment(date).date(), moment(date).month(), moment(date).year()]
  }
}
/*
  ====================================================================
  today
  --------------------------------------------------------------------
  Today's date as javascript date object
  ====================================================================

  Usage:

    {{ "" | today }}

  = 2020-02-01T00:00:00.000Z

*/

filters.today = () => {
  return new Date()
}

/*
  ====================================================================
  todayGovuk
  --------------------------------------------------------------------
  Today's date GOV.UK formatted
  ====================================================================

  Usage:

    {{ "" | todayGovuk }}

  = 19 March 2020

*/

filters.todayGovuk = () => {
  return moment().format('D MMMM YYYY')
}

/*
  ====================================================================
  dateToGovukDate
  --------------------------------------------------------------------
  Convert date object to govuk date (1 February 2020)
  ====================================================================

  Usage:

  {{ date | dateToGovukDate }}

  = 1 February 2020

*/

filters.dateToGovukDate = (date) => {
  if (date){
    let theDate = moment(date)
    if (theDate.isValid()){
      return theDate.format('D MMMM YYYY')
    }
  }
  return ''
}

filters.govukDate = (date) => {
  if (_.isArray(date)){
    return filters.arrayToGovukDate(date)
  }
  else return filters.dateToGovukDate(date)
}



/*
  ====================================================================
  arrayToGovukDate
  --------------------------------------------------------------------
  Convert array to govuk date
  ====================================================================

  Usage:

  {{ [1, 2, 2020] | arrayToGovukDate }}

  = 1 February 2020

*/

filters.arrayToGovukDate = (array) => {
  let dateObject = filters.arrayToDateObject(array)
  let govukDate = filters.dateToGovukDate(dateObject)
  return govukDate
}

/*
  ====================================================================
  prettyMonth
  --------------------------------------------------------------------
  Return month names from numbers.
  ====================================================================

  Usage:

  {{ 1 | prettyMonth }}

  = January

*/

filters.prettyMonth = (monthNumber) => {
  if (monthNumber){
    return moment().month(monthNumber - 1).format("MMMM");
  }
  else return ''
}

/*
  ====================================================================
  sortDateArrays
  --------------------------------------------------------------------
  Add support for sorting by date arrays
  ====================================================================
  Copied from https://github.com/mozilla/nunjucks/blob/master/nunjucks/src/filters.js#L425

  Requires positional args, no named args
*/

//
filters.sortDateArrays = (arr, reversed, attr) => {

    let array = _.map(arr, v => v)


    array.sort((a, b) => {
      let x = (attr) ? a[attr] : a
      let y = (attr) ? b[attr] : b

      // Convert arrays of 3 to date objects
      x = (_.isArray(x) && (x.length == 3)) ? filters.arrayToDateObject(x) : x
      y = (_.isArray(y) && (y.length == 3)) ? filters.arrayToDateObject(y) : y

      // console.log({x}, {attr})
      // if (!caseSens && _.isString(x) && _.isString(y)) {
      //   x = x.toLowerCase()
      //   y = y.toLowerCase()
      // }

      if (x < y) {
        return reversed ? 1 : -1
      } else if (x > y) {
        return reversed ? -1 : 1
      } else {
        return 0
      }
    })

    return array
  }

// https://momentjs.com/docs/#/displaying/format/
filters.formatDate = (date, format, dateFormat) => {

  var returnDate;
  // No date provided.
  if (!date){
    // console.log('error for', date, 'format', format);
    throw "Error in formatDate: no date provided";
  }
  // Check for valid date
  else if (dateFormat && moment(date, dateFormat).isValid()){
    returnDate = moment(date, dateFormat);
  }
  else if ( moment(date).isValid() ){
    returnDate = moment(date);
  }
  // Invalid date
  else {
    throw "Error in formatDate: invalid date";
  };

  switch (true)
    {
      // 2018-03-21
      case (format == 'dashDate'):
        return returnDate.format('YYYY-MM-DD');

      // 2018/03/21
      case (format == 'slashDate'):
        return returnDate.format('YYYY/MM/DD');

      // 2018/03
      case (format == 'yearMonth'):
        return returnDate.format('YYYY/MM');

      // 2018-03-21T00:00:00.000Z
      case (format == 'iso8601'):
        return returnDate.toISOString();

      // a year ago
      case (format == 'relative'):
        return timeAgoInDays(returnDate)

      // 21st March 2018
      case (format == 'pretty'):
        return returnDate.format('Do MMMM YYYY');

      // March 21st 2018, 12:00:00 am
      case (format == 'full'):
        return returnDate.format('MMMM Do YYYY, h:mm:ss a');

      // pass format through to moment
      case _.isString(format):
        return returnDate.format(format);

      // Default
      default:
        return returnDate.format();
    }
}

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters
