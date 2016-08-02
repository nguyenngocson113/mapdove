var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Crypto = require('crypto');
var jwt = require('jsonwebtoken');
var Config = require('../configurations/config');
var Utilities = require('../utilities/utilities');
var async = require('async');

var validateUsername = function  (value, callback) {
	return callback(value && (value.length > 3) &&  (value.length <= 32));
};

var validateUniqueEmail = function(value, callback) {
	mongoose.model('Users').count({
		email: value
	}, function (err, users) {
		return callback(err || users === 0);
	});
};

var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


var UserSchema = new Schema({
	username: {
		unique: true,
		type: String
	},
	email: {
		type: String,
		required: true,
		match: [emailRegex, 'Invalid email'],
		validate: [validateUniqueEmail, 'Email already exist']
	},
	hashed_password: {
		type: String,  
		require: true
	}, 
	salt: String,
	name: String,
	avatar: String,
	token: String,
	lastActivedAt: {
		type: Date,
		default: Date.now
	},
	createAt: {
		type: Date,
		default: Date.now	
	}
},{
	collection: 'users'
});

UserSchema.virtual('password').set(function  (password) {
	this._password = password;
	this.salt = this.makeSalt();
	this.hashed_password = this.hashPassword(password, this.salt);
}).get(function  () {
	return this._password;
});

// Encrypt password
function encrypt(password, salt) {
	var saltHash = new Buffer(salt, 'base64');
	return Crypto.pbkdf2Sync(password, saltHash, 071189, 64).toString('base64');
}

UserSchema.methods = {
	makeSalt: function  () {
		return Crypto.randomBytes(16).toString('base64');
	},
	hashPassword: function(password, salt) {
		if (!password || !salt) {
			return '';
		}
		return encrypt(password, salt);
	},
	checkLogin: function(password) {
		return (encrypt(password, this.salt) === this.hashed_password);
	}
};

UserSchema.statics = {
	token: function(user) {
		var profile = {
			_id: user._id,
			username: user.username,
		};
		return jwt.sign(profile, Config.JWTSecret);
	},
	avatar: function(user, callback) {
		if (user && user.avatar) {
			return callback(user.avatar);
		} else {
			return callback('http://gameapp.vn/images/no-avatar.png');
		}
	},
	getCommonInformation: function(user, userId, callback) {
		if (!user) {
			return callback(null, {});
		} else {
			that = this;
			async.series({
				avatar: function (cb) {
					return that.avatar(user, function  (avatar) {
						return cb(null, avatar);
					});
				}
			}, function  (error, data) {
				var userInfo = {};
				userInfo = Utilities.pickFields(user, ['_id', 'username', 'avatar']);
				return callback(Utilities.extendObject(userInfo, data));
			});
		}
	},
	detail: function(user, userId, callback) {
		if (!user) {
			return callback(null, {});
		}
		var that = this;
		async.parallel({
			lastActivedAt: function(cb) {
				
				return cb(null, Utilities.formatDate(user.lastActivedAt));
			},
			avatar: function(cb) {
				that.avatar(user, function(avatar) {
					return cb(null, avatar);
				});
			},
		}, function(error, data) {
			var removeFields = ['hashed_password', 'salt', '__v'];
			if (user._id != userId) {
				removeFields.push('email');
			}
			for (var i in removeFields) {
				user[removeFields[i]] = undefined;
				delete user[removeFields[i]];
			}
			console.log(Utilities.extendObject(user, data));
			return callback(Utilities.extendObject(user, data));
		});
	}
};

module.exports = mongoose.model('Users', UserSchema);