const express = require('express');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const path = require('path');
const morgan = require('morgan');
const router = require('./routes');
const session = require('express-session');
const mustacheExpress = require('mustache-express');

const app = express();

app.use(express.static( path.join(__dirname,"/public" )));

app.engine('mustache',mustacheExpress());
app.set('views','./views');
app.set('view engine', 'mustache');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(validator());

app.use(session({
  secret: 'cornbread',
  resave: false,
  saveUninitialized: false,
}));

// app.use(morgan('dev'));

app.set('port', (process.env.PORT || 3000));

app.use(router);

if(require.main === module){
  app.listen(app.get('port'), () => {
    console.log("App listening on port",app.get('port'));
  });
}

module.exports = app;
