// imports
const path    = require('path');
const readFTPdetectinfoFile = require('./mysql-functions/readFTPdetectinfoFile')
const {Image} = require('./mysql-functions/sequelize')
const Op = require('sequelize').Op;

require('dotenv').config({ path: path.resolve(__dirname, './.env') })

//get array of command line arguments
var FTPfiles = process.argv.slice(2);

FTPfiles.forEach(file => {
  try {
    const pngList = readFTPdetectinfoFile(file)
    console.log(pngList)
    Image.update({
      stars: 1,
    },{
      where:{
        stars: {
          [Op.lt]: 1
        },
        fileName: {
          [Op.in]: pngList
        }
      }
    })

  } catch(err) {
    console.log(err.message)
  }
})