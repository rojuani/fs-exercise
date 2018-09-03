import 'bootstrap'
import './scss/app.scss'

const template = require('./views/listItem.ejs');
const html = template({ name: 'carlos'})

    // document.getElementById('content').innerHTML = html;
    $('#content').html(html);
const asd=10