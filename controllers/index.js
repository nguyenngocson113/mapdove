var async = require('async');
var mongoose = require('mongoose');
var Users = mongoose.model('Users');
var Utilities = require('../utilities/utilities');

exports.login = function  (req, res) {
	username = req.body.username ? req.body.username : '';
	password = req.body.username ? req.body.password : '';

	var msg, user;
	async.series({
		findUser: function  (cb) {
			Users.findOne({
				username: req.body.username
			}, function  (err, u) {
				if(u){
					user = u;
					return cb(null);
				} else {
					msg = 'Incorrect username';
					return cb(true);
				}
			});
		},
		checkPassword: function  (cb) {
			msg = 'Incorrect password';
			return cb(!user.checkLogin(password));
		},
		getUserInfomation: function  (cb) {
			Users.getCommonInformation(user, null, function  (data) {
				user = data;
				return cb(null);
			});
		},
		token: function  (cb) {
			user.token = Users.token(user);
			return cb(null);
		}
	}, function  (error, result) {
		if (error) {
			res.jsonp(Utilities.response(false, {}, msg));
		} else {
			res.jsonp(Utilities.response(true, user));
		}
	});
}