const fs = require('fs');
const path = require('path');
const Op = require('sequelize').Op;
const Image = require('./sequelize');

function readFTPdetectinfoFile(file) {
  const detectinfoTest = /FTPdetectinfo[a-zA-Z0-9_.-]*\.txt/
  const fitsImageTest = /(FF_[a-zA-Z0-9_.-]*)(.fits)/g

  try {  
    if ( detectinfoTest.test(file) ) {

      console.log(file)

      var data = fs.readFileSync(file, 'utf8');
      const fitsList = data.match(fitsImageTest)
      const pngList = fitsList.map(item => item.replace(".fits", ".png")) 
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
    
    }
  
  } catch(err) {
    console.log('Error:', err.message);
  }
}

module.exports = readFTPdetectinfoFile