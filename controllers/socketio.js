var mongoose = require('mongoose');
var Rooms = mongoose.model('Rooms');
var Messages = mongoose.model('Messages');
var Utilities = require('../utilities/utilities');
var async = require('async');
var Config = require('../configurations/config');
var Locations = mongoose.model('Locations');


exports.addLocation = function (userInfo, data, callback) {
	var latitude = data.lat;
	var longitude = data.long;
	var userId = userInfo._id;

	var location,msg;

	async.series({
		checkUserLocation: function(cb) {
			Locations.findOne({
				_userId: userId
			}, function (err, loc) {
				console.log(loc);
				if(!err && loc){
					location = loc;
					location.lat = latitude;
					location.long = longitude;
					return cb(null);
				} else {
					location = new Locations({
						lat: latitude,
						long: longitude,
						_userId: userId
					});
					return cb(null);
				}
			});
		},
		saveOrUpadteLocation: function(cb) {
			location.save(function (err) {
				if(!err){
					return cb(null);
				} else {
					msg = Utilities.getErrorMessage(err);
					return cb(true);
				}
			});
		}
	}, function(error) {
		if (error) {
			return callback (msg);
		} else {
			return callback (location);
		}
	});
}