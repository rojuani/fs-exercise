import 'bootstrap'
import './scss/app.scss'

const template = require('./views/listItem.ejs');
// const html = template({ name: 'carlos al'})

    // document.getElementById('content').innerHTML = html;
    // $('#content').html(html);
    $.get("http://localhost:3000/items", function (response) {
      console.log(response)
      const html = template({ name: 'carlos al', items: response})
      $('#content').html(html);
    }).fail(function() {
      alert( "error" );
    })