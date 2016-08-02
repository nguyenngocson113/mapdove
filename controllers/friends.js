var mongoose = require('mongoose');
var Users = mongoose.model('Users');
var Friends = mongoose.model('Friends');
var Utilities = require('../utilities/utilities');
var async = require('async');
var Config = require('../configurations/config');


exports.addFriend = function (req, res) {
	var userId = req.user._id;
	var targetId = req.params.targetId;
	var msg, friend;
	async.series({
		checkTargetExist: function  (cb) {
			Users.count({
				_id: targetId,
			}, function  (err, c) {
				if(!err && c === 0){
					console.log(c);
					msg = 'TargetId not exist';
					return cb(true);
				} else {
					return cb(null);
				}
			});	
		},
		checkFriendExist: function (cb) {
			Friends.count({
				$or: [
				{ $and: [{_userId: userId}, {_targetId: targetId}] },
				{ $and: [{_userId: targetId}, {_targetId: userId}] }
				]
			}, function (err, c) {
				if(!err && c !== 0){
					msg = 'Sent invitations';
					return cb(true);
				} else {
					return cb(null);
				}
			});
		},
		createFriendObject: function  (cb) {
			friend = new Friends({
				_userId: userId,
				_targetId: targetId
			});
			return cb(null);
		},
		save: function  (cb) {
			friend.save(function  (err) {
				if(err) {
					msg =  Utilities.getErrorMessage(err);
					return cb(true);
				} else {
					return cb(null);
				}
			});
		}
	}, function  (error, result) {
		if (error) {
			return res.jsonp(Utilities.response(false, {}, msg));
		} else{
			return res.jsonp(Utilities.response(true,{friendId: friend._id}, "Add friend success"));
		};
	});
}

exports.acceptFriend = function (req, res) {
	var friendId = req.params.friendId;
	var userId = req.user._id;
	var friend, msg;
	async.series({
		checkFriendExist: function (cb) {
			Friends.findOne({
				_id: friendId
			}, function (err, fr) {
				if(!err && fr && (fr._targetId == userId)){
					friend = fr;
					return cb(null);
				} else {
					msg = "Invitation  does not exist";
					return cb(true);
				}
			});
		},
		saveAcceptFriend: function (cb) {
			friend.isFriend = true;
			friend.save(function (err) {
				if(!err){
					return cb(null);
				} else {
					msg =  Utilities.getErrorMessage(err);
					return cb(true);
				}
			});
		}
	}, function (error, result) {
		if(!error) {
			res.jsonp(Utilities.response(true, friend));
		} else {
			res.jsonp(Utilities.response(false, {}, msg));
		}
	});
}