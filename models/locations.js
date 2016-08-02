var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../configurations/config');
var Utilities = require('../utilities/utilities');
var async = require('async');

var LocationSchema = new Schema({
  _userId: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  lat: {
  	required: true,
  	type: Number
  },
  long: {
    required: true,
    type: Number

  }
}, {
  collection: 'locations'
});

// Export model
module.exports = mongoose.model('Locations', LocationSchema);
