'use strict'

const mongoose = require('mongoose')

const counterSchema = mongoose.Schema({
  _id: String,
  sequence_value: Number
})

counterSchema.statics.createCustom = function (id, cb) {
  this.create({ _id: id, sequence_value: 0 }, function (err, counter) {
    if (err) throw err
    cb(counter)
  })
}

const Counter = mongoose.model('Counter', counterSchema)

module.exports = Counter