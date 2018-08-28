'use strict'

const mongoose = require('mongoose')

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

module.exports = mongoose.model('Item', itemSchema)