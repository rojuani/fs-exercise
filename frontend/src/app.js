import 'bootstrap'
import './scss/app.scss'

const templateList = require('./views/listItem.ejs')
const templateForm = require('./views/formItem.ejs')
const config = require('./config')

let itemsList = []

import sortable from 'jquery-ui/ui/widgets/sortable'

$.ajax({
  url: config.apiUrl,
  headers: {
    Authorization:"Basic " + config.token
  },
  success: function (response) {
    itemsList = response
    const html = templateList({items: itemsList})
    $('#content').html(html);
    $("tbody").sortable(settings)
  },
  error: function (jqXHR, exception) {
    // todo: something
    console.log(exception, jqXHR)
  }
})

$('body').on('click', '#new-item', function(e) {
    e.preventDefault()
    document.getElementById('content').innerHTML = templateForm({item: undefined})
})

$('body').on('click', '#save', function(e) {
  e.preventDefault()
  const imageItem = $('#image-item').prop('files')[0]
  const textItem = $('#text-item').val()
  const formdata = new FormData()

  formdata.append('image', imageItem)
  formdata.append('description', textItem)

  let url = config.apiUrl
  let type = 'POST'
  let key = e.currentTarget.getAttribute('data-id')

  if (key !== null) {
    key = key.split('_')
    url += key[0]
    type = 'PUT'
  }

  $.ajax({
    url: url,
    type: type,
    data: formdata,
    headers: {
      Authorization:"Basic " + config.token
    },
    cache: false,
    contentType: false,
    processData: false,
    success: function(response) {
        if (key !== null && !isNaN(key[1]) && itemsList[key[1]] !== undefined) {
          itemsList[key[1]] = response
        } else {
          itemsList.push(response)
        }
        const html = templateList({ items: itemsList })
        $('#content').html(html);
      $("tbody").sortable(settings)
    },
    error: function (jqXHR, exception) {
        // todo: something
        console.log(exception, jqXHR)
    }
  })
})

$('body').on('click', '.delete-item', (e) => {
  e.preventDefault()
  if (confirm('Esta seguro que desea borrar el contenido?')) {
    const id = e.currentTarget.getAttribute('data-key')
    $.ajax({
      url: config.apiUrl + id,
      type: 'DELETE',
      headers: {
        Authorization:"Basic " + config.token
      },
      cache: false,
      contentType: false,
      processData: false,
      success: function(response) {
        const itemSelected = '#item-' + id
        const counter = document.getElementById('counter').innerHTML
        document.getElementById('counter').innerHTML = counter - 1
        delete itemsList[$(itemSelected).attr('data-index')]
        $(itemSelected).remove()
      },
      error: function (jqXHR, exception) {
        // todo: something
        console.log(exception, jqXHR)
      }
    })
  }
})

$('body').on('click', '.update-item', function(e) {
  e.preventDefault()
  const index = $('#item-' + e.currentTarget.getAttribute('data-key')).attr('data-index')
  //const index = e.currentTarget.getAttribute('data-index')
  itemsList[index].index = index
  document.getElementById('content').innerHTML = templateForm({ item: itemsList[index] })
})

const settings = {
  start: function (e, ui) {
    // creates a temporary attribute on the element with the old index
    $(this).attr('data-previndex', ui.item.index())
  },
  update: function (event, ui) {
    const newIndex = ui.item.index()
    const oldIndex = $(this).attr('data-previndex');
    const element_id = ui.item.attr('id');
    const previousElement = (newIndex < oldIndex) ? ui.item[0].nextElementSibling : ui.item[0].previousElementSibling
    $.ajax({
      url: config.apiUrl + element_id.split('-')[1],
      type: 'PUT',
      data: {position: $(previousElement).attr('data-position')},
      headers: {
        Authorization:"Basic " + config.token
      },
      success: function (response) {
        console.log(response)
      },
      error: function (jqXHR, exception) {
        // todo: something
        console.log(exception, jqXHR)
      }
    })
    $(this).removeAttr('data-previndex')
  }
}
