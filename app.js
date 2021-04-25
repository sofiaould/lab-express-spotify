/** @format */

require("dotenv").config();

const express = require("express");
const hbs = require("hbs");
hbs.registerPartials(__dirname + "/views/partials");

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) => console.log("Something went wrong when retrieving an access token", error));
// Our routes go here:

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/artist-search", function (req, res) {
  // res.render('/artist-search')
  spotifyApi
    .searchArtists(req.query.search)
    .then((data) => {
      console.log("The received data from the API!");
      let dataView = [];
      data.body.artists.items.map((val) => {
        if (val.images[0]) {
          dataView.push(createDataCard(val, "artists"));
        }
      }, []);
      console.log(dataView);
      // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
      res.render("artist-search-results", { data: dataView }); // on va rendre la view ds laquelle on injecte la data
    })
    .catch((err) => console.log("The error while searching artists occurred: ", err));
});
app.get("/albums/:id", async (req, res, next) => {
  try {
    let dataSpotify = await spotifyApi.getArtistAlbums(req.params.id);
    let dataView = dataSpotify.body.items.map((element) => createDataCard(element, "albums"));
    console.log(dataView);
    res.render("albums-search-results", { data: dataView });
  } catch (error) {
    console.log("Oops error => ", error);
  }
});
app.get("/tracks/:id", async (req, res, next) => {
  try {
    let dataSpotify = await spotifyApi.getAlbumTracks(req.params.id);
    //let dataView = dataSpotify.body.items.map((element) => createDataCard(element, "tracks"));
    let test = await spotifyApi.getAudioFeaturesForTrack(dataSpotify.body.items[0].id);
    // let test = await spotifyApi.getAudioAnalysisForTrack(dataSpotify.body.items[0].id);
    console.log(dataSpotify.body.items);
    res.render("tracks-search-results" /*, { data: dataView }*/);
  } catch (error) {
    console.log("Oops error => ", error);
  }
});

app.listen(3000, () => console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊"));

/**
 * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
 * images to fit into a certain area.
 *
 * @param {Number} srcWidth width of source image
 * @param {Number} srcHeight height of source image
 * @param {Number} maxWidth maximum available width
 * @param {Number} maxHeight maximum available height
 * @return {Object} { width, height }
 */
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
  var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

  return { width: srcWidth * ratio, height: srcHeight * ratio };
}

function createDataCard(srcData, type) {
  let newdata = {};
  if (srcData.images[0]) {
    newdata = {
      name: srcData.name,
      image: {
        url: srcData.images[0].url,
        size: calculateAspectRatioFit(srcData.images[0].width, srcData.images[0].height, 150, 150),
      },
      id: srcData.id,
    };
    return { ...newdata, type: type, subType: type === "artists" ? "albums" : "tracks" };
  }
  return;
}
