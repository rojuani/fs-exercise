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
  try {
    Item.find({}, {}, { sort: {position: 'asc'} }, function (err, items) {
      if (err) throw err
      const itemData = items.map(function (item) {
        return item.toClient()
      })
      res.json(itemData)
    })
  } catch (e) {
    console.log(e)
    res.status(500).send('An unexpected error occurred')
  }
}

function create(req, res) {
  const form = new formidable.IncomingForm()
  try {
    form.parse(req, function (err, fields, files) {
      if (err) throw err
      if (files.image === undefined || fields.description === undefined) {
        res.status(400).send('The fields image and description are required.')
        return
      }
      cloudinary.uploader.upload(files.image.path, function (result) {
        const url = result.url.split('/')
        const item = new Item()
        item.picture = url[url.length - 1]
        item.description = fields.description
        getNextSequenceValue('position', function (position) {
          item.position = position
          item.save(function (err) {
            if (err) throw err
            res.status(201).send(item.toClient())
          })
        })
      })
    })
  } catch (e) {
    console.log(e)
    res.status(500).send('An unexpected error occurred')
  }
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
          if (err) reject('The item could not be modified')
          item.position = position
          item.save(function (err) {
            if (err) reject('The item could not be modified')
          })
        }
      )
    }
    resolve('updated')
  })

}

function update(req, res) {
  const id = req.params.id
  try {
    Item.findById(id, function (err, item) {
      if (err) throw err
      // If only we update the position
      if (req.body.position !== undefined) {
        updatePosition(item, req.body.position).then(function (msj) {
          res.send(msj)
          return
        }).catch(function (err) {
          res.status(400).send(JSON.stringify(err))
        })
      }

      const form = new formidable.IncomingForm()
      form.parse(req, function (err, fields, files) {
        if (err) throw err
        if (files.image === undefined && fields.description === undefined) {
          res.status(400).send("No fields were sent to modify.")
          return
        }
        if (files.image !== undefined) {
          cloudinary.uploader.upload(files.image.path, function (result) {
            const url = result.url.split('/')
            const oldPicture = item.picture.split('.')[0]
            cloudinary.v2.uploader.destroy(oldPicture, { invalidate: true }, function (err, result) {
              if (err) throw err
            })
            item.picture = url[url.length - 1]
            if (fields.description !== undefined) {
              item.description = fields.description
            }
            item.save(function (err) {
              if (err) throw err
              res.send(item.toClient())
            })
          })
        } else if (fields.description !== undefined) {
          item.description = fields.description
          item.save(function (err) {
            if (err) throw err
            res.send(item.toClient())
          })
        }
      })
    })
  } catch (e) {
    console.log(e)
    res.status(500).send('An unexpected error occurred')
  }
}

function destroy(req, res) {
  const id = req.params.id
  try {
    Item.findByIdAndRemove(id, function (err, item) {
      if (err) throw err
      if (!item) {
        res.status(404).send('Not found')
        return
      }
      cloudinary.v2.uploader.destroy(item.picture.split('.')[0], { invalidate: true }, function (err, result) {
        if (err) throw err
        res.send('deleted')
      })
    })
  } catch (e) {
    console.log(e)
    res.status(500).send('An unexpected error occurred')
  }
}

function getNextSequenceValue(sequenceName, cb) {
  Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { sequence_value: 1 } },
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