var Config = require('./configurations/config');

var mongoose = require('mongoose'); 

var SocketIO = require('./controllers/socketio');

var async = require('async');

function connectIO(server) {
  global.io = require('socket.io')(server);
  var socketioJwt = require('socketio-jwt');
  var store = require('redis').createClient();

  var redis = require('socket.io-redis');
  global.io.adapter(redis({ host: 'localhost', port: 6379 }));

  global.io.use(socketioJwt.authorize({
    secret: Config.JWTSecret,
    handshake: true
  }));

  // On connect
  global.io.on('connection', function(socket) {
    var userInfo = socket.decoded_token;
    userInfo.iat = undefined;
    delete userInfo.iat;
    var deviceInfo = {};

    console.log('********** socket id ' + socket.id + ' with username ' + userInfo.username + ' connected');

    // Save client data to redis with key is userId

    updateRedisData();
    /* *************************** EVENTS ******************************** */

    // On send message event
    socket.on('location', function(data) {
      console.log(data);

      SocketIO.addLocation(userInfo, data, function(result) {
        emitLocationToClient(result, data);
      });
    });

    // On disconnect event
    socket.on('disconnect', function() {
      console.log('********** socket id ' + socket.id + ' with username ' + userInfo.username + ' disconnected');
    });

    /* *************************** ACTIONS ******************************** */


    function doEmitChat(userId, result) {
      // Get user socket data in redis

      store.get(userId, function(err, redisData) {
        // If online, emit data
        if (redisData) {
          redisData = JSON.parse(redisData);
          for (var i in redisData) {
            global.io.to(redisData[i]).emit('location', result);
          }
        }
      });
    }

    // Emit chat event to clients
    function emitLocationToClient(result, data) {
      result.data.sequence = data.sequence;

      // If failed, emit back to sender
      if (!result.success) {
        socket.emit('location', result);
      }
      // Else emit to room
      else {
        async.series({
          emit: function(cb) {
            var members = [userInfo._id];
            members.push(result.targetId);
            members = members.slice();
            // Emit event to users in room
            async.each(members, function(mem, cb1) {
              doEmitChat(mem, result);
              updateUserUnreadMessage(mem, data.roomId);
              return cb1();
            });
            return cb();
          }
        });
      }
    }

    function updateUserUnreadMessage(userId, roomId) {
      mongoose.model('UserInRoomStatus').update({
        _userId: userId,
        _roomId: roomId
      }, {
        $inc: {
          countUnread: 1
        }
      }, {
        upsert: true
      }).exec(function  (error) {
        if(!error) {
          console.log('save unread success');
        } else {
          console.log('save error');
        }
      });
    }

    // Update redis data
    function updateRedisData() {
      store.get(userInfo._id, function(err, data) {
        var clientData;
        if (data) {
          clientData = JSON.parse(data);
          clientData.push(socket.id);
        } else {
          clientData = [socket.id];
        }
        store.set(userInfo._id, JSON.stringify(clientData));
      });
    }
  });
}

exports = module.exports = connectIO;
