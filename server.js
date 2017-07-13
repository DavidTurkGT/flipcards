const express = require('express');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const path = require('path');
const morgan = require('morgan');
const router = require('./routes');

const app = express();

app.set(express.static, path.join(__dirname,"public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(validator());

// app.use(morgan('dev'));

app.set('port', (process.env.PORT || 3000));

app.use(router);

if(require.main === module){
  app.listen(app.get('port'), () => {
    console.log("App listening on port",app.get('port'));
  });
}

module.exports = app;
