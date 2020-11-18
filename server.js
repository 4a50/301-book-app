'use strict';

const express = require('express')
const superagent = require('superagent');
const dotenv = require('dotenv');
const cors = require('cors');
const pg = require('pg');
const { render } = require('ejs');

dotenv.config();



const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);


app.use(cors());
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

//Routes
app.get('/', homePage);

app.get('/searches/new', showForm);
app.post('/searches', createSearch);
app.get('/books/:id', bookView);

app.get('/hello', (req, res) => {
  res.render('pages/index');
})


//Listening to the ether

client.connect()
  .then(() => {
    console.log('Spun up the Databass');
    app.listen(PORT, () => {
      console.log(`Server is working on ${PORT}`);
    })
  })
  .catch(err => {
    console.log('Unable to connect, guess we are antisocial:', err);
  });
//Functions

function bookView(req,res){
  let SQL = 'SELECT * FROM books WHERE id=$1';
  // console.log('req.params.id', req.params.id);
  let values = [req.params.id];

  return client.query(SQL, values)
    .then (result => {
      // console.log('result',result);
      console.log(result.rows[0]);
      return res.render('pages/showDetail', {searchResults: result.rows[0]});
    })
    .catch((err) => errorRender(err));

}

function homePage(req, res) {
  try {
    let sql = 'SELECT * FROM books';
    client.query(sql)
      .then(result => {
        console.log(result);
        res.render('pages/index', {
          bookShelf: result.rows
        });
      })
      .catch((err) => errorRender(err));
  }
  catch (err) {
    console.log(err);
  }
}

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
        res.render('pages/searches/show', { searchResults: results });
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
  ('imageLinks' in info ? this.image_url = info.imageLinks.thumbnail : this.image_url = 'https://i.imgur.com/J5LVHEL.jpg');
  this.isbn = `${info.industryIdentifiers[0].type} ${info.industryIdentifiers[0].identifier}`;

  if (this.image_url.substring(0, 6) !== 'https') {
    let imageLinkString = this.image_url.substring(6);
    let imageUrl = 'https:/' + imageLinkString;
    this.image_url = imageUrl;
  }
  console.log(this);
}
