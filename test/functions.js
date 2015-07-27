var niceEchoNest = require('../index');
var echo = niceEchoNest({'apiKey': process.env['ECHO_NEST_API_KEY']});
echo.songProfile({track_id: 'spotify:track:5ZVxR2lLvGky9Or49R618p'}, 
function(err, result) {
     var songName = result.songs[0].title;
     var artistName = result.songs[0].artist_name;
     var musicBrainzId;
     
result.songs[0].artist_foreign_ids.forEach(function(artist_foreign_id) {
          if (artist_foreign_id.catalog === 'musicbrainz') {
               musicBrainzId = artist_foreign_id.foreign_id;
               return;
          }
     });
     console.log(songName, '-', artistName, '=', musicBrainzId);
});

