var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../configurations/config');
var Utilities = require('../utilities/utilities');
var async = require('async');

var FriendSchema = new Schema({
  _userId: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  _targetId: {
  	required: true,
  	type: Schema.Types.ObjectId,
  	ref: 'Users'
  },
  isFriend: {
    type: Boolean,
  	default: false
  }
}, {
  collection: 'friends'
});

// Static functions
FriendSchema.statics = {
  checkExistById: function(roomId, callback) {
    var room = false;
    async.series({
      checkInDb: function(cb) {
        mongoose.model('Rooms').findOne({
          _id: roomId,
        }).select('title members').lean().exec(function(error, r) {
          room = r;
          return cb(error || !r);
        });
      }
    }, function(error) {
      return callback(room);
    });
  }
};

// Export model
module.exports = mongoose.model('Friends', FriendSchema);
