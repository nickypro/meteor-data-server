const dateformat = require('dateformat')
const Sequelize = require('sequelize');
const creds = require('../credentials/mysql.json')
const sequelize = new Sequelize(creds.database, creds.user, creds.password, {
  dialect: 'mysql',
  timestamps: false
})

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })                                                                                                                                                                                                                               
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  }); 

const Image = sequelize.define('image', {
  //folder, file, path: folderPath(folder), date, camera}
  filePath: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  date: {
    type: Sequelize.DATE(6),
    allowNull: false,
  },
  camera: {
    type: Sequelize.STRING,
  },
  stars: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  label: {
    type: Sequelize.STRING,
  },
  info: {
    type: Sequelize.STRING,
  }
}, {
  // in aditional options, we index date for quick lookup
  indexes:[
    {
      unique: true,
      fields:['filePath']
    },{
      unique: false,
      fields:['date']
    },{
      unique: false,
      fields:['stars']
    }
  ]
});

const LabelPoints = sequelize.define('image_points', {
  filePath: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  meteor: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  satellite: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  aircraft: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  wildlife: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  clouds: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  other: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
}, {
  //additional options
  indexes:[
    {
      unique: true,
      fields:['filePath']
    }
  ]
})

const DayWithImage = sequelize.define('day_with_image', {
  day: {
    type: Sequelize.DATEONLY,
    primaryKey: true,
    allowNull: false,
  }
}, {
  // additional options
  timestamps: false,
})

Image.findByClosestTime = async function (date, options) {
  try {
    //make date MySQL friendly
    const sqlDate = dateformat(date, "yyyy-mm-dd HH:MM:ss", true)
    const number = options.number || 5
    const flag   = options.flag || "" 
    const label  = options.filters.label

    const query = 
    `SELECT * FROM (
      ( SELECT *, TIMESTAMPDIFF(SECOND, '${sqlDate}', date) AS diff
          FROM images WHERE date >= '${sqlDate}'
          ${label ? `AND label = '${label}'` : ""}
          ORDER BY date ASC LIMIT ${(flag==="BEFORE")? 1 : number}
      ) UNION ( 
        SELECT *, TIMESTAMPDIFF(SECOND, '${sqlDate}', date) AS diff
          FROM images where date < '${sqlDate}'
          ${label ? `AND label = '${label}'` : ""}
          ORDER BY date DESC LIMIT ${(flag==="AFTER")? 0 : number}
      )
    ) foo
    ORDER BY ABS(diff)
    LIMIT ${number-0+1};`

    let array = await sequelize.query(query)
    return array;

  } catch (err) {
    console.log("\nError getting closest events : \n", err.message)
    return null
  }
}

module.exports = {
  Image, 
  DayWithImage, 
  LabelPoints, 
  sequelize
}