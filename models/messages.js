var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../configurations/config');
var Utilities = require('../utilities/utilities');

var async = require('async');

var MessageSchema = new Schema({
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
  type: {
    type: Number,
    default: Config.Files.Types.Text
  },
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'messages'
});

// Static functions
MessageSchema.statics = {
  detail: function(message, callback) {
    async.parallel({
      createdAt: function(cb) {
        return cb(null, Utilities.formatDate(message.createdAt));
      },
      _userId: function(cb) {
        mongoose.model('Users').getCommonInformation(message._userId, null, function(user) {
          return cb(null, user);
        });
      }
    }, function(error, data) {
      message = Utilities.pickFields(message, ['_id', '_roomId', 'message', 'createdAt', 'type']);
      return callback(Utilities.extendObject(message, data));
    });
  }
};

// Post-save hook
MessageSchema.post('save', function(doc) {
  mongoose.model('Rooms').update({
    _id: doc._roomId.toString()
  }, {
    $set: {
      updatedAt: Date.now()
    }
  }).exec();
});

// Post-remove hook
MessageSchema.post('remove', function(doc) {

});


// Export model
module.exports = mongoose.model('Messages', MessageSchema);
