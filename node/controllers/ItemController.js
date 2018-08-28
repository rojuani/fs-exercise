'use strict'

const formidable = require('formidable')
const config = require('../config')
const Item = require('../models/item')
const Counter = require('../models/counter')
const cloudinary = require('cloudinary')
cloudinary.config({
  cloud_name: config.cdn.cloudName,
  api_key: config.cdn.apiKey,
  api_secret: config.cdn.apiSecret
})

function index(req, res) {
  Item.find({}, {}, { sort: {position: 'asc'} }, function (err, items) {
    items.map(function (item) {
      item.picture = config.cdn.url + item.picture
      return item
    })
    res.json(items)
  })
}

function create(req, res) {
  const form = new formidable.IncomingForm()
  form.parse(req, function(err, fields, files) {
    if (files.image === undefined || fields.description === undefined) {
      res.send('The fields image and description are required.')
      return
    }
    cloudinary.uploader.upload(files.image.path, function(result) {
      const url = result.url.split('/')
      const item = new Item()
      item.picture = url[url.length - 1]
      item.description = fields.description
      getNextSequenceValue('position', function (position) {
        item.position = position
        item.save(function(err) {
          if (err)
            throw err
          res.send('created!').status(201)
        })
      })
    })
  })
}

const updatePosition = function (item, position) {
  return new Promise(function (resolve, reject) {
    if (!/^[1-9]\d*$/.test(position)) {
      reject('The attribute position should be integer number.')
    }
    position = Number(position)
    if (item.position !== position) {
      let inc, range
      if (item.position > position) {
        inc = { position: 1 }
        range = { $gte: position, $lt: item.position }
      } else {
        inc = { position: -1 }
        range = { $gt: item.position, $lte: position }
      }
      Item.update(
        { position: range },
        { $inc: inc },
        { multi: true },
        function (err, raw) {
          if (err) throw err
          item.position = position
          item.save(function (err) {
            if (err) throw err
          })
        }
      )
    }
    resolve('updated')
  })

}

function update(req, res) {
  const id = req.params.id
  Item.findById(id, function (err, item) {
    if (err) throw err
    if (req.body.position !== undefined) {
      updatePosition(item, req.body.position).then(function (msj) {
        res.send(msj)
      }).catch(function (err) {
        res.send(JSON.stringify(err)).status(404)
      })
    }
    const form = new formidable.IncomingForm()
    form.parse(req, function(err, fields, files) {
      if (files.image === undefined && fields.description === undefined) {
        res.send("No fields were sent to modify.")
        return
      }
      if (files.image !== undefined) {
        cloudinary.uploader.upload(files.image.path, function(result) {
          const url = result.url.split('/')
          const oldPicture = item.picture.split('.')[0]
          cloudinary.v2.uploader.destroy(oldPicture, {invalidate: true }, function(err, result) {
            if (err) throw err
          })
          item.picture = url[url.length - 1]
          item.save(function(err) {
            if (err) throw err
          })
        })
      }
      if (fields.description !== undefined) {
        item.description = fields.description
        item.save(function(err) {
          if (err) throw err
        })
      }
      res.send('updated')
    })
  })
}

function destroy(req, res) {
  const id = req.params.id
  Item.findByIdAndRemove(id, function (err, item) {
    if (err) throw err
    cloudinary.v2.uploader.destroy(item.picture.split('.')[0], {invalidate: true }, function(err, result) {
      if (err) throw err
      res.send('deleted')
    })
  })
}

function getNextSequenceValue(sequenceName, cb) {
  Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { sequence_value: 1 }},
    { new: true },
    function (err, counter) {
      if (err) throw err
      if (counter) {
        cb(counter.sequence_value)
        return
      }
      Counter.createCustom(sequenceName, function (counter) {
        counter.sequence_value = 1
        counter.save(function (err) {
          if (err) throw err
          cb(counter.sequence_value)
        })
      })
    }
  )
}

module.exports = {
  index,
  create,
  update,
  destroy
}