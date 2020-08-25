//requiring path and fs modules
const DATABASE_UPDATE_LENGTH = 1000;
const path = require('path');
const fs = require('fs');
const dateFormat = require('dateformat')

const parseFilesInFolder = require('./parseFilesInFolder')
const {Image, DayWithImage, LabelPoints} = require('./sequelize')

//define function to add items to database:
function addArrayToDatabase( array ) {
  console.log(`Pushing to database - ${array.length} entries`)

  Image.sync().then(() => 
    Image.bulkCreate(array, {
      updateOnDuplicate: ["date", "filePath", "fileName"] 
    })
  )

  DayWithImage.sync().then(() => {
    let daysSet = new Set() 
    for (let i in array) {
      daysSet.add(dateFormat(array[i].date, "yyyy-mm-dd", true))
    }
    let daysArray = [...daysSet]
    daysArray = daysArray.map(day => ({day: day}) )

    DayWithImage.bulkCreate(daysArray, {
      updateOnDuplicate: ["day"]
    })
  })

  LabelPoints.sync()
}

// define the process for looking through folders and updating the database
function updateImagesDatabase(directoryPath = path.join(__dirname, "/images")) {
  
  //joining path of directory 
  const folderPath = (folderName) => path.join(directoryPath, folderName)

  //passsing directoryPath and callback function
  const folders = fs.readdirSync(directoryPath)

  //array of all the files
  let array = []
  let totalFiles = 0
  let errors = []

  //listing all folders
  while (folders.length > 0) try {
    //we look at the last folder
    const folder = folders.pop()
    
    //we look for any subfolders
    let subfolders = fs.readdirSync(path.join(directoryPath, folder), { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(subfolder => path.join(folder, subfolder.name))

    //then we add subfolders to the end
    folders.push(...subfolders)
    
    //add new files to the array
    array = [...array, ...parseFilesInFolder(folder, folderPath(folder))] 

    // if the array is long enough we can add the data now
    if (array.length > DATABASE_UPDATE_LENGTH) {
      addArrayToDatabase( array )
      totalFiles += array.length
      array = []
    }

  } catch (err) {
      // handle any errors (due to permissions or otherwise)
    console.log("ERROR : ", err.message)
    errors.push(err.message)
  }

  // add remaining database entries
  addArrayToDatabase( array )
  totalFiles += array.length

  console.log(`Total Files Found : ${totalFiles}`)
  console.log("Errors: ", errors ? errors : "No errors!")

}

module.exports = updateImagesDatabase
