
var Lodash = require('lodash');
var Moment = require('moment');
var checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');


/* VALIDATE MONGODB ID */
exports.validateObjectId = function(id, callback) {
  return callback(checkForHexRegExp.test(id));
};


/* CREATE A RESPONSE OBJECT */
exports.response = function(success, data, message, statusCode) {
  return {
    success: success,
    statusCode: statusCode ? statusCode : 200,
    message: message ? message : 'Successfully',
    data: data ? data : {}
  };
};

/* GET ERROR MESSAGE FROM ERROR */
exports.getErrorMessage = function(err) {
  var errText = '';
  if (!err) {
    errText = 'Server error';
  } else if (err.errors) {
    errText = err.errors[Object.keys(err.errors)[0]] ? err.errors[Object.keys(err.errors)[0]].message : 'Server error';
    console.log(err.errors[Object.keys(err.errors)[0]]);
  } else {
    errText = err.message;
  }
  return errText;
};

/* PICK SELECTED FIELDS FROM OBJECT */
exports.pickFields = function(obj, fields) {
  var result = {};
  if (!obj || !Object.keys(obj).length) {
    return result;
  } else {
    for (var i in fields) {
      result[fields[i]] = obj[fields[i]];
    }
    return result;
  }
};

/* EXTEND 2 OBJECTS */
exports.extendObject = function(obj1, obj2) {
  return Lodash.extend(obj1, obj2);
};

exports.formatDate = function(date, lang) {
  if (!lang) {
    lang = 'en';
  }
  var now = Moment(Date.now());
  var time = Moment(date);
  var timeDiff = now.diff(time, 'days', true);
  var formatTime;
  // If less than 1 day, use Xhours ago
  if (timeDiff > 0 && timeDiff < 1) {
    formatTime = time.fromNow();
  }
  // Else format time
  else {
    formatTime = Moment(date).format('DD/MM/YYYY [at] HH:mm');
  }
  return {
    raw: date,
    format: formatTime
  };
};