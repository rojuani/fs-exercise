'use strict'

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const config = require('./config')
const PORT = process.env.PORT || 8082
const cors = require('cors')
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

mongoose.connect(config.db.host, function(err) {
  if (err) {
    console.log('MongoDB connection error: ' + err)
    process.exit(1);
  }
})

const routes = require('./routes')
routes.assignRoutes(app)

if(!module.parent) {
  const server = app.listen(PORT, () => {
      console.log('Running on http://' + server.address().address + ':' + server.address().port)
  })
}

module.exports = app