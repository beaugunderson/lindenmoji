'use strict';

var async = require('async');
var botUtilities = require('bot-utilities');
var generateCurve = require('./generate-curve.js');
var program = require('commander');
var render = require('./render-curve.js');
var Twit = require('twit');
var _ = require('lodash');

_.mixin(botUtilities.lodashMixins);
_.mixin(Twit.prototype, botUtilities.twitMixins);

var SCREEN_NAME = process.env.SCREEN_NAME;

var TWEET_LENGTH = 140;
var PHOTO_LENGTH = 24;

var MAX_LENGTH = TWEET_LENGTH - PHOTO_LENGTH;

function goodCurve() {
  var curve;
  var tweet;

  while (!tweet || tweet.length > MAX_LENGTH) {
    curve = generateCurve();
    tweet = curve.replace(/; /g, ';\n');
  }

  return {curve: curve, tweet: tweet};
}

function goodSystem(cb) {
  var meta = {};
  var good;
  var last;

  console.log('iterating to find a good system...');

  async.whilst(function () {
    return !meta.aspect ||
           meta.aspect >= 10 ||
           meta.points.total <= 5 ||
           meta.points.x <= 3 ||
           meta.points.y <= 3;
  }, function (cbWhilst) {
    good = goodCurve();

    render(good.curve, 1024, 1024, false, function (err, buffer, renderMeta) {
      if (err || !buffer) {
        cbWhilst(err);
      }

      meta = renderMeta;

      meta.aspect = Math.max(meta.width, meta.height) /
                    Math.min(meta.width, meta.height);

      console.log('metadata: %j', meta);

      last = buffer;

      cbWhilst();
    });
  }, function (err) {
    cb(err, last, good.tweet);
  });
}

program
  .command('tweet')
  .description('Generate and tweet an image')
  .option('-r, --random', 'only post a percentage of the time')
  .action(botUtilities.randomCommand(function () {
    goodSystem(function (err, buffer, tweet) {
      if (err) {
        throw err;
      }

      var T = new Twit(botUtilities.getTwitterAuthFromEnv());

      if (_.percentChance(25)) {
        var bot = botUtilities.imageBot();

        tweet = botUtilities.heyYou(bot) + '\n' + tweet;

        if (bot === 'Lowpolybot') {
          tweet += ' #noRT';
        }
      }

      tweet = {status: tweet};

      T.updateWithMedia(tweet, buffer, function (updateError, response) {
        if (updateError) {
          return console.error('TUWM error', updateError, response.statusCode);
        }

        console.log('TUWM OK');
      });
    });
  }, 97));

program
  .command('respond')
  .description('Respond to replies')
  .action(function () {
    var T = new Twit(botUtilities.getTwitterAuthFromEnv());

    var stream = T.stream('user');

    // Look for tweets where image bots mention us and retweet them
    stream.on('tweet', function (tweet) {
      // Discard tweets where we're not mentioned
      if (!tweet.entities ||
          !_.some(tweet.entities.user_mentions, {screen_name: SCREEN_NAME})) {
        return;
      }

      var curve = tweet.text.replace(new RegExp('.*@' + SCREEN_NAME + '\s*'), '');

      console.log('rendering curve for', tweet.user.screen_name, curve);

      render(curve, 1024, 1024, false, function (err, buffer) {
        if (err || !buffer) {
          throw err;
        }

        var reply = {
          in_reply_to_status_id: tweet.id_str,
          status: '@' + tweet.user.screen_name
        };

        T.updateWithMedia(reply, buffer, function (updateError, response) {
          if (updateError) {
            return console.error('TUWM error', updateError, response.statusCode);
          }

          console.log('TUWM OK');
        });
      });
    });
  });

program.parse(process.argv);
