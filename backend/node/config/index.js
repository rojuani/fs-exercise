const util = require('util')

module.exports = {
  db: {
    host: process.env.DB_HOST + process.env.DB_NAME
  },
  cdn: {
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
    cloudName: process.env.CLOUD_NAME,
    url: util.format(`http://res.cloudinary.com/${process.env.CLOUD_NAME}/image/upload/c_limit,h_320,w_320/`)
  },
  credentials: {
    username: process.env.USERNAME,
    password: process.env.PASS
  }
}