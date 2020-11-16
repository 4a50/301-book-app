'use strict';

const express = require ('express')
const superagent = require ('superagent');
const dotenv = require ('dotenv');
const cors = require ('cors');
const pg = require ('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.static('./public'));

app.get('/hello', (req, res) => {
  app.render('index');
})

app.listen(PORT, () => {
  console.log(`Server is working on ${PORT}`);
})
