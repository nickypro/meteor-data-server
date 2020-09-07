const fs = require('fs');
const path = require('path');

function readFTPdetectinfoFile(file) {
  const detectinfoTest = /FTPdetectinfo[a-zA-Z0-9_.-]*\.txt/
  const fitsImageTest = /(FF_[a-zA-Z0-9_.-]*)(.fits)/g

  try {  
    if ( detectinfoTest.test(file) ) {

      console.log(file)

      var data = fs.readFileSync(file, 'utf8');
      const fitsList = data.match(fitsImageTest)
      const pngList = fitsList.map(item => item.replace(".fits", ".png")) 
      
      return pngList

    }
  
  } catch(err) {
    console.log('Error:', err.message);
    return []
  }
}

module.exports = readFTPdetectinfoFile