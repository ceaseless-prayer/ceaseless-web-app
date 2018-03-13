'use strict';

var _ = require('lodash');

var middleware = function (app) {
  var fetchProfileInfo = function (entity) {
    return function (userInfo) {
      return app.adapter.find(entity, {email: userInfo.email});
    };
  };

  var getPictureType = function (dataUri) {
    var types = [
      {
        regex: /^data:image\/png;base64,/,
        mimetype: 'png'
      },
      {
        regex: /^data:image\/jpeg;base64,/,
        mimetype: 'jpeg'
      },
      {
        regex: /^data:image\/jpg;base64,/,
        mimetype: 'jpg'
      },
      {
        regex: /^data:image\/bmp;base64,/,
        mimetype: 'bmp'
      }
    ];

    var prefix = dataUri.substring(0, 25); // smaller string to work with
    var dataType = '';
    _.each(types, function (type) {
      if(prefix.match(type.regex)) {
        dataType = type.mimetype;
      }
    });
    return dataType;
  };

  var fetchProfilePicture = function (profileInfo) {
    return fetchPicture(profileInfo.profilePictureSnapshot);
  };

  var fetchStatusPicture = function (statusInfo) {
    return fetchPicture(statusInfo.image);
  };

  var fetchPicture = function (picture) {
    if (picture) {
      return {
        image: new Buffer(picture
          .replace(/^data:image\/png;base64,|^data:image\/jpeg;base64,|^data:image\/jpg;base64,|^data:image\/bmp;base64,/, '')
          , 'base64'),
        type: getPictureType(picture)
      };
    } else {
      throw new Error('Image not found');
    }
  };

  var trackImageHit = function (req) {
    var details = {
      ipAddress: req.ip,
      srcEmail: req.query.srcEmail,
      id: req.query.id,
      entity: req.query.entity
    };

    // If a profile picture is loaded, track the hit
    app.adapter.create('metric', {
      event: 'profilePictureFetched',
      subject: req.query.id, /* Who is it about? */
      details: JSON.stringify(details), // Serialized JSON of details
      time: new Date()
    });
  };

  var trackEmailOpen = function (req) {
    var details = {
      ipAddress: req.ip,
      srcEmail: req.query.srcEmail,
      jobId: req.query.jobId // a reference to the job that sent the e-mail
    };
    console.log('creating metric');
    app.adapter.create('metric', {
      event: 'emailOpen',
      subject: req.query.srcEmail,
      details: JSON.stringify(details),
      time: new Date()
    });
  };

  var trackPrayedFor = function (req) {
    var details = {
      ipAddress: req.ip,
      srcEmail: req.query.srcEmail,
      jobId: req.query.jobId, // a reference to the job that sent the e-mail
      authorIds: req.query.authorIds
    };

    app.adapter.create('metric', {
      event: 'prayedFor',
      subject: req.query.srcEmail, // the subscriber is the subject in this case
      details: JSON.stringify(details),
      time: new Date()
    });
  };

  return {
    publicProfile : function (req, res, next) {
      if (!req.path.match(/publicProfile/i)) {
        return next();
      }

      app.adapter.find('user', {_id : req.query.id})
        .then(function (profile) {
          res.send(profile);
        })
        .catch(function (error) {
          res.send(404);
        });
    },
    profilePicture : function (req, res, next) {
      if (!req.path.match(/profilePicture/i)) {
        return next();
      }
      // sanitize possible entities
      if (!_.contains(['user', 'intercessor', 'subscriber', 'member'], req.query.entity)) {
        res.send(404);
      } else {
        app.adapter.find(req.query.entity, {_id : req.query.id})
          .then(fetchProfileInfo(req.query.entity))
          .then(fetchProfilePicture)
          .then(function (picture) {
            res.set('Content-Type', 'image/'+picture.type);
            res.set('Content-Length', picture.image.length);
            res.send(200, picture.image);
            return req;
          })
          .then(trackImageHit)
          .catch(function (error) {
            res.send(404);
          });
      }
    },
    statusPicture : function (req, res, next) {
      if (!req.path.match(/statusPicture/i)) {
        return next();
      }

      app.adapter.find('prayerUpdate', { _id: req.query.id })
        .then(fetchStatusPicture)
        .then(function (picture) {
          res.set('Content-Type', 'image/'+picture.type);
          res.set('Content-Length', picture.image.length);
          res.send(200, picture.image);
        })
        .catch(function (error) {
          res.send(404);
        });
    },
    prayedFor: function (req, res, next) {
      if (!req.path.match(/prayedFor/i)) {
        return next();
      }
      var authorIds = [];
      if (!_.isEmpty(req.query.authorIds)) {
        authorIds = req.query.authorIds.split(',');
        app.adapter.findMany('user', authorIds)
          .then(function (rawAuthors) {
            // cleanup and protection
            var authors = rawAuthors.map(function (author) {
              return _.omit(author, ['password', 'links', 'email']);
            });
            res.send(200, authors);
            return req;
          })
          .then(trackPrayedFor)
          .catch(function (error) {
            res.send(404);
          });
      } else {
        res.send(404);
      }
    },
    loadImage : function (req, res, next) {
      if (!req.path.match(/loadImage/i)) {
        return next();
      }

      // this is a 1 px transparent png.
      var image = new Buffer('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='
        , 'base64');

      res.set('Content-Type', 'image/png');
      res.set('Content-Length', image.length);
      res.send(200, image);

      trackEmailOpen(req);
    }
  };
};

module.exports = middleware;