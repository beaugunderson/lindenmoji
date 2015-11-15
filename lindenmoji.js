'use strict';

var botUtilities = require('bot-utilities');
var generateCurve = require('./generate-curve.js');
var program = require('commander');
var render = require('./render-curve.js');
var Twit = require('twit');
var _ = require('lodash');

_.mixin(botUtilities.lodashMixins);
_.mixin(Twit.prototype, botUtilities.twitMixins);

var SCREEN_NAME = process.env.SCREEN_NAME;

program
  .command('tweet')
  .description('Generate and tweet an image')
  .option('-r, --random', 'only post a percentage of the time')
  .action(botUtilities.randomCommand(function () {
    var curve = generateCurve();

    render(curve, 1024, 1024, false, function (err, buffer) {
      if (err || !buffer) {
        throw err;
      }

      var T = new Twit(botUtilities.getTwitterAuthFromEnv());

      var tweet = curve.replace(/; /g, ';\n');

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
  }));

program
  .command('retweet')
  .description('Retweet replies')
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

      // T.post('statuses/retweet/:id', {id: tweet.id_str},
      //     function (err, data, response) {
      //   if (err || response.statusCode !== 200) {
      //     return console.log('TUWM error', err, data);
      //   }

      //   console.log('Successfully retweeted tweet', tweet.id_str);
      // });
    });
  });

program.parse(process.argv);
