const Controllers = require("./controllers")

module.exports.assignRoutes = (app) => {
  app.get('/items', Controllers.ItemController.index)
  app.post('/items', Controllers.ItemController.create)
  app.put('/items/:id', Controllers.ItemController.update)
  app.delete('/items/:id', Controllers.ItemController.destroy)
}