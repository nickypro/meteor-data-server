# meteor-data-server
Backend process for parsing all the meteor images data for Camera Name and Timestamp

Looks for RMS-style image files from AllSky/RaspberryPi, parses the camera name and event timestamp, and adds the entry to a MySQL database.

## Setup
- First, `git clone https://github.com/pesvut/meteor-data-server.git`
- Install packages: `npm install`
- Add MySQL credentials to /credentials/mysql.json in this format:
```
{
  "host": "",
  "user": "",
  "password": "",  
  "database": "",
  "port": 3306
}
```

- create a .env file and add `IMAGE_PATH=/path/to/images/` (or if using systemd add `Environment=IMAGE_PATH=/path/to/images/`)
- optional: if serving files, you can change port using `PORT=8080` or whatever you want
- run the process with either `node server.js` or `npm start` (or create a systemd process with /usr/bin/node etc...)

## Remarks
This uses node express file serving, but that could also be replaced with nginx or something else, just make the paths stay the same.
to remove the file serving, add the environmental variable
`DO_NOT_SERVE=1`
