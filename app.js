var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require("cors");

const port = 5001

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var Pusher = require('pusher');

var pusher = new Pusher({
  appId: '<key here>',
  key: '<key here>',
  secret: '<key here>',
  cluster: 'eu',
  useTLS: 'True'
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/channels_trigger', function (req, res) {
  pusher.trigger('my-channel', 'my-event', { message: "hello world" });
  res.send();
});

app.get('/delete_user/:userId', function (req, res) {
  pusher.terminateUserConnections(req.params.userId).then((result) => { console.log(result) });
  res.send();
});

app.get('/send_to_user/:userId', function (req, res) {
  pusher.sendToUser(req.params.userId, "my-event", { message: "hello world" });
  res.send();
});

app.post("/pusher/user-auth", (req, res) => {
  const socketId = req.body.socket_id;
  const user = { id: "ben" }; // Replace this with code to retrieve the actual user id
  const authResponse = pusher.authenticateUser(socketId, user);
  res.send(authResponse);
});

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;