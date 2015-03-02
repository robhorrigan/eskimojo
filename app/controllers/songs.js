
// # song

var _ = require('underscore');
var _str = require('underscore.string');
_.mixin(_str.exports());

var paginate = require('express-paginate');

exports = module.exports = function(Song) {

  function index(req, res, next) {
    Song.paginate({}, req.query.page, req.query.limit, function(err, pageCount, songs, itemCount) {
      if (err) {
        return next(err);
      }

      res.format({
        html: function() {
          res.render('songs', {
            songs: songs,
            pageCount: pageCount,
            itemCount: itemCount
          });
        },
        json: function() {
          // inspired by Stripe's API response for list objects
          res.json({
            object: 'list',
            has_more: paginate.hasNextPages(req)(pageCount, songs.length),
            data: songs
          });
        }
      });
    });
  }

  function _new(req, res, next) {
    res.render('songs/new');
  }

  function create(req, res, next) {
    if (!_.isString(req.body.name) || _.isBlank(req.body.name)) {
      return next({
        param: 'name',
        message: 'Name is missing or blank'
      });
    }

    Song.create({
      name: req.body.name
    }, function(err, song) {
      if (err) {
        return next(err); 
      }

      res.format({
        html: function() {
          req.flash('success', 'Successfully created song');
          res.redirect('/songs');
        },
        json: function() {
          res.json(song);
        }
      });
    });
  }

  function show(req, res, next) {
    Song.findById(req.params.id, function(err, song) {
      if (err) {
        return next(err);
      }

      if (!song) {
        return next(new Error('Song does not exist'));
      }

      res.format({
        html: function() {
          res.render('songs/show', {
            song: song
          });
        },
        json: function() {
          res.json(song);
        }
      });
    });
  }

  function edit(req, res, next) {
    Song.findById(req.params.id, function(err, song) {
      if (err) {
        return next(err);
      }

      if (!song) {
        return next(new Error('Song does not exist'));
      }

      res.render('songs/edit', {
        song: song
      });
    });
  }

  function update(req, res, next) {
    Song.findById(req.params.id, function(err, song) {
      if (err) {
        return next(err);
      }

      if (!song) {
        return next(new Error('Song does not exist'));
      }

      if (!_.isString(req.body.name) || _.isBlank(req.body.name)) {
        return next({
          param: 'name',
          message: 'Name is missing or blank'
        });
      }

      song.name = req.body.name;
      song.save(function(err, song) {
        if (err) {
          return next(err);
        }

        res.format({
          html: function() {
            req.flash('success', 'Successfully updated song');
            res.redirect('/songs/' + song.id);
          },
          json: function() {
            res.json(song);
          }
        });
      });
    });
  }

  function destroy(req, res, next) {
    Song.findById(req.params.id, function(err, song) {
      if (err) {
        return next(err);
      }

      if (!song) {
        return next(new Error('Song does not exist'));
      }

      song.remove(function(err) {
        if (err) {
          return next(err);
        }

        res.format({
          html: function() {
            req.flash('success', 'Successfully removed song');
            res.redirect('/songs');
          },
          json: function() {
            // inspired by Stripe's API response for object removals
            res.json({
              id: song.id,
              deleted: true
            });
          }
        });
      });
    });
  }

  return {
    index: index,
    'new': _new,
    create: create,
    show: show,
    edit: edit,
    update: update,
    destroy: destroy
  };

};

exports['@singleton'] = true;
exports['@require'] = [ 'models/song' ];
