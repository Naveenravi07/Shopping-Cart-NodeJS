var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { engine: hbs } = require("express-handlebars");
const db = require('./config/dbConnect')
const session = require('express-session')
const fileUpload=require('express-fileupload')

//Db Connection
db.connect((err) => {
  if (err) return console.log('Connection To Db Failed' + err);
  else {
    console.log("Database Connected Successfully To Port 27017");
  }
})

//Routers
var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('view engine', 'hbs');
app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/' }))

//Sessioning

app.use(session({ secret: "key", cookie: { maxAge: 180 * 60 * 1000 } }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload())
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
