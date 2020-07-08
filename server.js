
// imports
const express = require('express');
const path    = require('path');
const updateImagesDatabase = require('./mysql-functions/updateImagesDatabase')
require('dotenv').config({ path: path.resolve(__dirname, './.env') })

//CONFIGURE folder where images are stored (can replace) and how often to run
const imagesDir = process.env.IMAGE_PATH || path.join(__dirname, "/images/") 
const TIME_INTERVAL = 12 * 3600 * 1000 /* milliseconds = every 12 hours*/

//initialise database with files
updateImagesDatabase(imagesDir)

setInterval(() => 
  updateImagesDatabase(imagesDir)
, TIME_INTERVAL)

// make serving files optional
if ( !process.env.DO_NOT_SERVE ) {

  //initialise node express app
  const app = express();

  //Add a logger of requests
  const logger = (req, res, next) => {
    console.log(`${new Date().toUTCString()} - ${req.method} ${req.path} - ${req.ip}`);
    next();
  }
  app.use(logger)

  //serve the images directory
  app.use('/images', express.static(imagesDir));

  //start the server on PORT
  //would also be better to just serve the files using nginx/apache 
  const PORT = process.env.PORT || 80
  app.listen(PORT, function () {
      console.log(`Listening on http://localhost:${PORT}/`);
  }); 

}