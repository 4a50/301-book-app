'use strict';

const express = require('express')
const superagent = require('superagent');
const dotenv = require('dotenv');
const cors = require('cors');
const pg = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

//Routes
app.get('/searches/new', showForm);
app.post('/searches', createSearch);
app.get('/hello', (req, res) => {
  res.render('pages/index');
})


//Listening to the ether

app.listen(PORT, () => {
  console.log(`Server is working on ${PORT}`);
})

//Functions

function showForm(req, res) {
  try { res.render('pages/searches/new.ejs'); }
  catch (err) {
    res.render('pages/error', errorRender(err));
  }

}

function createSearch(req, res) {
  try {
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';

    if (req.body.search[1] === 'title') { url += `+intitle:${req.body.search[0]}`; }

    if (req.body.search[1] === 'author') { url += `+inauthor:${req.body.search[0]}`; }

    superagent.get(url)
      .then(data => {
        return data.body.items.map(book => new Book(book.volumeInfo));
      })
      .then(results => {
        res.render('pages/searches/show', { searchResults: JSON.stringify(results) });
      })
      .catch(err => {
        res.render('pages/error', errorRender(err));
      });
  }
  catch (err) {
    res.render('pages/error', errorRender(err));
  }
}

function errorRender(err) {

  console.log('ErRor FunCtIon', err);
  return {
    errorString: 'Your Request Cannot be processed',
    error: err
  };
}

function Book(info) {
  this.title = info.title || 'No Title Available!  Check something else!';
  this.author = info.authors || 'No Author Information Available, blame Google!';
  this.description = info.description || 'This book does not have a description, perhaps you should post one.';

  ('imageLinks' in info ?

    this.image = info.imageLinks.thumbnail : this.image = 'https://i.imgur.com/J5LVHEL.jpg');

  if (this.image.substring(0, 6) !== 'https') {
    let imageLinkString = this.image.substring(6);
    let imageUrl = 'https:' + imageLinkString;
    this.image = imageUrl;
  }

}
