var express = require('express');
var app = express();
var session=require('express-session');
var bodyParser = require('body-parser');
var cors = require('cors');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var PORT = process.env.PORT || 8080;
const md5 = require('md5')
const _ = require('lodash')
var path = require('path');
var users = [];

var freezer = {};
var usersRouter = require('./routes/users');
app.use(express.static(__dirname + '/public'));

app.use(cors());

app.use(bodyParser.urlencoded({
  extended: true
}));
 
app.use(bodyParser.json());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(session({resave: true, saveUninitialized: true, secret: 'secret-code-chat-sv-232-3', cookie: { maxAge: 60000 }}));

app.use(cors());
app.use(bodyParser.json());

app.get('/chat',function(req,res){

	// request : son cabeceras y datos que nos envia el navegador.
	// response : son todo lo que enviamos desde el servidor.
	res.render('chat');
});


//
// Function that  checks whether the user with suck name already exist
//
app.get('/isnamefree',function(req,res){
	var user = _.findIndex(users, {name: md5(req.query.user)});
	if (user == -1){
		res.send('ok')
        console.log('Username ->Ok');
	} else {
		res.send('busy')
        console.log('Username->Not invald');
	}
});

app.use('/', usersRouter);
function connectClients(clientID) {

  // Let's find free users to chat with
  var free = _.filter(users, {busy: false})

  // If there is someone else one website except you
  if (free.length>1){

    var partner = undefined;
    while (!partner){
      var randomInt = Math.round(Math.random()*free.length-1);
			if(free[randomInt]){
				if ((free[randomInt].id != clientID) && (!free[randomInt].busy)){
	        partner = free[randomInt]
	      }
			}
    }

    firstClient = _.find(users, {id: clientID})
    firstClient.busy = true;
    firstClient.partner = partner.id;

    partner.busy = true;
    partner.partner = clientID;

    io.to(clientID).emit('status', {status: "connected", partner: partner.id});
    io.to(partner.id).emit('status', {status: "connected", partner: clientID});


  } else {
    io.to(clientID).emit('status', {status: "pending"});
  }

}


function reconnectusers(userA, userB){
    userB.partner = userA.id;
    io.to(userB.id).emit('status', {status: "connected", partner: userA.id});
    console.log('Connect success!');
    io.to(userA.id).emit('status', {status: "connected", partner: userB.id});
}


io.on('connection',function(socket){

  var isInList = _.find(users, {name: md5(socket.handshake.query.user)})
  console.log(socket.handshake.query.user)
  if (!isInList){
    var client = {
      id: socket.id,
      busy: false,
      name: md5(socket.handshake.query.user)
    }
    users.push(client)
    // And connect new user to someone else
    connectClients(socket.id)
  } else {

    clearTimeout(freezer[isInList.name])
    isInList.id = socket.id
    var second = _.find(users, {id: isInList.partner})
    reconnectusers(isInList, second)

  }



  //
  // Block 2 - message exchange
  //
  socket.on('message', function (data) {
    io.to(data.partner).emit('message', data);
  });
  //
  // End of block2
  //





  //
  // Block 3 - if user disconnect
  //
  socket.on('disconnect', function() {

    var user = _.find(users, {id: socket.id})

    if (user){

      if (user.partner){
        var partner = _.find(users, {id: user.partner})
        if (partner.waiting){
          var index = _.findIndex(users, {id: partner.id})
          users.splice(index, 1)
          user.partner = null;
        }
      }
      // Check if user connected to any user
      if (user.partner){

          var partner = _.find(users, {id: user.partner})
					io.to(partner.id).emit('status', {status: "pending"});
          user.waiting = true;
          freezer[user.name] = setTimeout(function(){
            console.log('delete')

  					partner.partner = undefined
  					partner.busy = false

            var index = _.findIndex(users, {id: user.id})
            users.splice(index, 1)
            connectClients(partner.id);

          }, 5000)
					// Try to connect disconnected user to somone else




      } else {
        var index = _.findIndex(users, {id: user.id})
        users.splice(index, 1)
      }
    }

  });


});


http.listen(PORT,function(){
	console.log('Listen to port',PORT);
});
