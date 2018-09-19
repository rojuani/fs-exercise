'use strict'

const mongoose = require('mongoose')
const config = require('../config')

const itemSchema = mongoose.Schema({
	picture: String,
	description: {
		type: String,
		maxlength: 300
	},
	position: Number
})
itemSchema.path('description').validate(function (v) {
return v.length < 300
})

itemSchema.method('toClient', function() {
  const obj = this.toObject()

  // Data layer
  return {
    id: obj._id,
    picture: config.cdn.url + obj.picture,
    description: obj.description,
    position: obj.position
  }
})

module.exports = mongoose.model('Item', itemSchema)