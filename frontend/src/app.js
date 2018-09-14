import 'bootstrap'
import './scss/app.scss'

const templateList = require('./views/listItem.ejs')
const templateForm = require('./views/formItem.ejs')

let itemsList = []

import autocomplete from 'jquery-ui/ui/widgets/autocomplete';

/*$('<h1>Welcome to the programming languages quiz</h1>').appendTo('body');
new autocomplete({
  source: ['javascript', 'css', 'c', 'vuejs', 'nuxt']
}).element.appendTo('body').focus();]*/
    // document.getElementById('content').innerHTML = html;
    // $('#content').html(html);
$.get("http://localhost:3000/items", function (response) {
  console.log(response)
    itemsList = response
  const html = templateList({ items: itemsList })
  $('#content').html(html);
}).fail(function() {
  alert( "error" );
})

$('body').on('click', '#new-item', function(e) {
    e.preventDefault();
    console.log('new')
    document.getElementById('content').innerHTML = templateForm({item: undefined})
})

$('body').on('click', '#save', function(e) {
    e.preventDefault();
    console.log('block buttom save')
    const imageItem = $('#image-item').prop('files')[0]
    const textItem = $('#text-item').val()
    console.log($('#image-item').prop('files')[0], textItem)
    var formdata = new FormData()

    formdata.append('image', imageItem)
    formdata.append('description', textItem)
  
    let url = 'http://localhost:3000/items'
    let type = 'POST'
  
    let key = e.currentTarget.getAttribute('data-id')
    if (key !== null) {
      key = key.split('_')
      url += '/' + key[0]
      type = 'PUT'
    }
    
    $.ajax({
        url: url,
        type: type,
        data: formdata,
        // dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        success: function(response) {
            console.log(response)
            if (key !== null && !isNaN(key[1]) && itemsList[key[1]] !== undefined) {
              itemsList[key[1]] = {image: 'updated.png', description: 'update icon'}
            } else {
              itemsList.push({image: 'adad.png', description: 'lalalala'})
            }
            const html = templateList({ items: itemsList })
            $('#content').html(html);
        },
        error: function (jqXHR, exception) {
            // todo: something
            console.log(exception, jqXHR)
        }
    })

    // document.getElementById('content').innerHTML = templateForm()
})

$('body').on('click', '.delete-item', (e) => {
  e.preventDefault()
  if (confirm('Esta seguro que desea borrar el contenido?')) {
    const id = e.currentTarget.getAttribute('data-key')
    $.ajax({
      url: 'http://localhost:3000/items/' + id,
      type: 'DELETE',
      // data: formdata,
      // dataType: 'json',
      cache: false,
      contentType: false,
      processData: false,
      success: function(response) {
        console.log(response)
        const itemSelected = '#item-' + id
        const counter = document.getElementById('counter').innerHTML
        document.getElementById('counter').innerHTML = counter - 1
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
  e.preventDefault();
  console.log('update')
  const index = e.currentTarget.getAttribute('data-index')
  itemsList[index].index = index
  document.getElementById('content').innerHTML = templateForm({ item: itemsList[index] })
})
