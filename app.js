/** @format */

require("dotenv").config();

const express = require("express");
const hbs = require("hbs");

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
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );
// Our routes go here:

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/artist-search", function (req, res) {
  // res.render('/artist-search')
  spotifyApi
    .searchArtists(req.query.search)
    .then((data) => {
      console.log("The received data from the API: ", data.body.artists.items);
      // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
      res.render("artist-search-results", { data: data.body.artists.items }); // on va rendre la view ds laquelle on injecte la data
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

app.get("/albums/:id", function (req, res, next) {
  // trouver id du bon album
  // res.render('/artist-search')
  spotifyApi
    .getArtistAlbums(req.params.id)
    .then((data) => {
      console.log(data.body.items[0]);
      // console.log('The received data from the API: ', data.body.album.items);
      // // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
      res.render("album-search", { data: data.body.items }); // on va rendre la view ds laquelle on injecte la data
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

app.get("/tracks/:id", function(req,res,next){
  spotifyApi.getAlbumTracks(req.params.id)
  .then(function(data) {
    console.log(data.body.items)
    res.render("tracks", { data: data.body.items}); 
  }, function(err) {
    console.log('Something went wrong!', err);
  });

})



app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
