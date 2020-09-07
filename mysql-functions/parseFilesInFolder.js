const fs = require('fs');
const ParseDateFromImageFileName = require('./parseDateFromImageFileName')
//parses information from each file in a folder
function parseFilesInFolder(folder, folderPath) {

  let array = []
  console.log(`Reading files in folder : ${folder}`)
  files = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => !file.isDirectory())
    .map(file => file.name)
  //parse info from the file name
  files.forEach(file => {
      
    //get time of image
    const {date, camera} = parseDateFromImageFileName(file)
    if(!date) {
      return;
    }

    //console.log(folder, file)
    array.push({filePath: `/${folder}/${file}`,fileName: file, date, camera})
  })

  console.log(`Read ${array.length} files from folder ${folder}`)
  return array
}

module.exports = parseFilesInFolder