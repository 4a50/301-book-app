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


app.get('/hello', (req, res) => {
  res.render('pages/index');
})

app.listen(PORT, () => {
  console.log(`Server is working on ${PORT}`);
})
