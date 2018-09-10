import 'bootstrap'
import './scss/app.scss'

const templateList = require('./views/listItem.ejs')
const templateForm = require('./views/formItem.ejs')

let itemsList = []
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
        document.getElementById('content').innerHTML = templateForm()
    })

    $('body').on('click', '#save', function(e) {
        e.preventDefault();
        console.log('save')
        const imageItem = $('#image-item').prop('files')[0]
        const textItem = $('#text-item').val()
        console.log($('#image-item').prop('files')[0], textItem)
        var formdata = new FormData()

        formdata.append('image', imageItem)
        formdata.append('description', textItem)

        $.ajax({
            url: 'http://localhost:3000/items',
            type: 'POST',
            data: formdata,
            // dataType: 'json',
            cache: false,
            contentType: false,
            processData: false,
            success: function(response) {
                console.log(response)
                itemsList.push({image: 'adad.png', description: 'lalalala'})
                const html = templateList({ items: itemsList })
                $('#content').html(html);
            },
            error: function (jqXHR, exception) {
                // todo: something
                console.log(exception, jqXHR)
            }
        });

        document.getElementById('content').innerHTML = templateForm()
    })
