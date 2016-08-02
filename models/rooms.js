var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../configurations/config');
var Utilities = require('../utilities/utilities');
var async = require('async');

var RoomsSchema = new Schema({
  members: [{
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'Users'
  }],
  _userId: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  title: {
    type: String,
    default: ''
  }
}, {
  collection: 'rooms'
});

// Static functions
RoomsSchema.statics = {
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
  },
  detail: function(room, userId, callback) {
    async.parallel({
      _id: function  (cb) {
        return cb(null, room._id);
      },
      title: function  (cb) {
        return cb(null, room.title);
      },
      isAdmin: function(cb) {
        return cb(null, room._userId.toString() === userId);
      },
      members: function(cb) {
        if (!room.members) {
          return cb(null, []);
        } else {
          var Users = mongoose.model('Users');
          var users = [];
          async.each(room.members, function(member, cb1) {
            if (member._id.toString() !== userId) {
              Users.getCommonInformation(member, userId, function(u) {
                users.push(u);
                return cb1(null);
              });
            } else {
              return cb1(null);
            }
          }, function(err) {
            return cb(null, users);
          });
        }
      },
      lastMessage: function(cb) {
        mongoose.model('Messages').findOne({
          _roomId: room._id
        }).sort('-createdAt').select('message _userId createdAt type')
        .populate('_userId', Config.Populate.User).lean().exec(function(err, message) {
          if (err || !message) {
            return cb(null, {});
          } else {
            message.createdAt = Utilities.formatDate(message.createdAt);
            return cb(null, Utilities.pickFields(message, ['message', 'type', '_userId', '_id', 'createdAt']));
          }
        });
      },
      countUnread: function(cb) {
        mongoose.model('UserInRoomStatus').findOne({
          _roomId: room._id,
          _userId: userId
        }).select('countUnread').lean().exec(function(err, status) {
          var countUnread = 0;
          if (status) {
            countUnread = status.countUnread;
          }
          return cb(null, countUnread);
        });
      }
    }, function(err, data) {
      return callback(data);
    });
}
};

var UserInRoomStatusSchema = new Schema({
  _userId: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  _roomId: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'Rooms'
  },
  countUnread: {
    type: Number,
    default: 0
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'user_in_room_status'
});

// Export model
module.exports = mongoose.model('Rooms', RoomsSchema);
module.exports = mongoose.model('UserInRoomStatus', UserInRoomStatusSchema);
