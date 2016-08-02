var mongoose = require('mongoose');
var Users = mongoose.model('Users');
var Utilities = require('../utilities/utilities');
var async = require('async');
var Config = require('../configurations/config');

/* MIDDLEWARE */
exports.queryLeanUser = function(req, res, next, id) {
	var msg;
	async.series({
		validateObjectId: function(cb) {
			Utilities.validateObjectId(id, function(isValid) {
				msg = 'Invalid user id';
				return cb(!isValid);
			});
		},
		find: function(cb) {
			Users.findOne({
				_id: id
			}).lean().exec(function(err, user) {
				req.userData = user;
				msg = 'User not found';
				return cb(err);
			});
		}
	}, function(error) {
		if (error) {
			return res.status(404).jsonp(Utilities.response(false, {}, msg, 404));
		}
		next();
	});
};

/* MIDDLEWARE */
exports.queryUser = function(req, res, next, id) {
	var msg;
	async.series({
		validateObjectId: function(cb) {
			Utilities.validateObjectId(id, function(isValid) {
				msg = 'Invalid user id';
				return cb(!isValid, 'Invalid user id');
			});
		},
		find: function(cb) {
			var populateFields = Config.Populate.User + ' lastActivedAt';

			if (req.user._id && (req.user._id === id)) {
				populateFields = Config.Populate.UserFull;
			}

			Users.findOne({
				_id: id
			}).select(populateFields).exec(function(err, user) {
				req.userData = user;
				msg = 'User not found';
				return cb(err);
			});
		}
	}, function(error) {
		if (error) {
			return res.status(404).jsonp(Utilities.response(false, {}, msg, 404));
		}
		next();
	});
};


exports.create = function  (req, res) {
	var user, msg;
	async.series({
		checkUserExist: function  (cb) {
			Users.count({
				username: req.body.username
			}, function  (err, c) {
				if(!err && c === 0){
					return cb(null);
				} else {
					msg = 'Username already exist';
					return cb(true);
				}
			});	
		},
		checkPasswordLength: function  (cb) {
			if(!req.body.password || req.body.password.length < 5){
				msg = 'Password must be at least 5 characters';
				return cb(true);
			}
			return cb(null);
		},
		createUserObject: function  (cb) {
			user = new Users(req.body);
			return cb(null);
		},
		save: function  (cb) {
			user.save(function  (err) {
				msg = Utilities.getErrorMessage(err);
				return cb(err);
			});
		},
		token: function  (cb) {
			return cb(null, Users.token(user));
		}
	}, function  (error, result) {
		if (error) {
			return res.jsonp(Utilities.response(false, {}, msg));
		} else{
			return res.jsonp(Utilities.response(true,{
				_id: user._id,
				email: user.email
			}));
		};
	});
}

exports.show = function  (req, res) {
	var userId = req.user._id ? req.user._id : '';
	console.log(typeof(req.user._id));
	Users.detail(req.userData, userId, function  (data) {
		res.jsonp(Utilities.response(true, data));
	});
}

exports.getListUser = function  (req, res) {
	var userId = req.user._id;

	mongoose.model('Friends').find({
		$or:[{_userId: userId}, {_targetId: userId}]
	})
	.populate('_targetId', Config.Populate.User)
	.populate('_userId', Config.Populate.User)
	.exec(function  (error, friends) {
		async.map(friends, 	function  (friend, cb) {
			var user;
			if(friend._userId._id === userId) {
				user = friend._targetId;
			} else {
				user = friend._userId;
			}

			Users.getCommonInformation(user, null, function  (data) {
				return cb(null, data);
			});
		}, function  (error, result) {
			if(!error) {
				res.jsonp(Utilities.response(true, result));
			} else {
				res.jsonp(Utilities.response(false, []));
			}
		});
	});
}

