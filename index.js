var xtend = require('xtend');
var moment = require('moment');
var querystring = require('querystring');
var url = require('url');
var RateLimiter = require('request-rate-limiter');

module.exports = function(options) {
     var options = xtend({
               apiKey: null,
               apiUrlEndPoint: 'http://developer.echonest.com/api/v4',
               // apiRateLimit: 120, // If this is not set, it will be pulled from the HTTP headers
               apiRateLimitExceededError: true,
               apiRateLimit: 120,
               apiRateInterval: 60,
               apiErrorCode: 429,
               defaultBuckets: ['id:musicbrainz', 'id:spotify']
          }, options);

     var limiter = new RateLimiter({
          rate: options.apiRateLimit,
          interval: options.apiRateInterval,
          backoffCode: options.apiErrorCode
     });

     function _request(apiFunction, apiQuery, callback) {
          apiQuery = xtend({
               api_key: options.apiKey
               }, apiQuery);


          var reqUrl = url.parse(options.apiUrlEndPoint + '/' + apiFunction + '?' + querystring.stringify(apiQuery));
          console.log(reqUrl.href);

          limiter.request({
               method: 'GET',
               url: reqUrl.href,
               json: true
          }).then(function(response) {
               if (response.statusCode != 200) {
                    return callback(Error('Server returned code: ' + response.statusCode), response['body'])
               }
               callback(null, response['body']['response']);
          }).catch(function(err) {
               callback(err, response['body']);
          });
     }

     function _filterParams(params, allowedKeys) {
          approvedParams = {};
          allowedKeys.forEach(function(key) {
               if (params.hasOwnProperty(key)) {
                    approvedParams[key] = params[key];
               }
          });
          if (!approvedParams.hasOwnProperty('bucket') && allowedKeys.indexOf('bucket') != -1) {
               approvedParams.bucket = options.defaultBuckets;
          }
          return approvedParams;
     }

     var echoNest = {};

     echoNest.songProfile = function(params, callback) {
          params = _filterParams(params, ['id','track_id','bucket','limit']);
          _request('song/profile', params, callback);
     }

     echoNest.songSearch = function(params, callback) {
          params = _filterParams(params, ['format','title','artist','combined','description','style','mood','rank_type','artist_id','results','start','song_type','max_tempo','min_tempo','max_duration','min_duration','max_loudness','min_loudness','artist_max_familiarity','artist_min_familiarity','artist_start_year_before','artist_start_year_after','artist_end_year_before','artist_end_year_after','song_max_hotttnesss','song_min_hotttnesss','artist_max_hotttnesss','artist_min_hotttnesss','min_longitude','max_longitude','min_latitude','max_latitude','max_danceability','min_danceability','max_energy','min_energy','max_liveness','min_liveness','max_speechiness','min_speechiness','max_acousticness','min_acousticness','mode','key','bucket','sort','limit']);
          _request('song/search', params, callback);
     }

     return echoNest;
}
