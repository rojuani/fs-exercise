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

  //Rename fields
  obj.id = obj._id
  delete obj._id
  delete obj.__v
  obj.picture = config.cdn.url + obj.picture

  return obj;
})

module.exports = mongoose.model('Item', itemSchema)