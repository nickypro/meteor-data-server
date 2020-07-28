//requiring path and fs modules
const path = require('path');
const fs = require('fs');
const dateFormat = require('dateformat')

const parseFilesInFolder = require('./parseFilesInFolder')
const {Image, DayWithImage, LabelPoints} = require('./sequelize')

function updateImagesDatabase(directoryPath = path.join(__dirname, "/images")) {
  
  //joining path of directory 
  const folderPath = (folderName) => path.join(directoryPath, folderName)

  //passsing directoryPath and callback function
  const folders = fs.readdirSync(directoryPath)

  //array of all the files
  let array = []

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
  } catch (err) {
    console.log(err.message)
  }

  console.log(`Array: ${array.length}`)
  console.log("Example : ", array[0])

  Image.sync().then(() => 
    Image.bulkCreate(array, {
      updateOnDuplicate: ["date"] 
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

module.exports = updateImagesDatabase
