//var mongojs = require("mongojs");
var db =null;//
//mongojs('127.0.0.1:27017/myGame', ['account','progress']);
 
var express = require('express');
var app = express();
var serv = require('http').Server(app);
 
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client2/index.html');
});
app.use('/client2',express.static(__dirname + '/client2'));
 
serv.listen(process.env.PORT||2000);
console.log("Server started.");
 
var SOCKET_LIST = {};
 
var Entity = function(param){
	var self = {
		x:250,
		y:250,
		id:"",
	}
	if(param){
		if(param.x)
			self.x = param.x;
		if(param.y)
			self.y = param.y;
		if(param.id)
			self.id = param.id;		
	}
	return self;
}
 
var Player = function(param){
	var self = Entity(param);
	self.number = "" + Math.floor(10 * Math.random());
	
	self.username = "";
	self.score = 0;
	self.ch = '';
	self.turn = 0;

	
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,	
			score:self.score,
			ch:self.ch,
			score:self.score,
			username:self.username
		};		
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			score:self.score,
			ch:self.ch,
			score:self.score,
			username:self.username

		}	
	}

	//}
	Player.list[self.id] = self;
 
	initPack.player.push(self.getInitPack());
	return self;
}
Player.list = {};
Player.onConnect = function(socket, username){
	var player = Player({
		username:username,
		id:socket.id,
	});
	socket.on("choice", function(data){
		player.ch=data.ch;
		player.turn=data.turn;
		player.username=username;
	});

	socket.on('sendMsgToServer',function(data){
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',player.username + ': ' + data);
		}
	});
	socket.on('sendPmToServer',function(data){ //data:{username,message}
		var recipientSocket = null;
		for(var i in Player.list)
			if(Player.list[i].username === data.username)
				recipientSocket = SOCKET_LIST[i];
		if(recipientSocket === null){
			socket.emit('addToChat','The player ' + data.username + ' is not online.');
		} else {
			recipientSocket.emit('addToChat','From ' + player.username + ':' + data.message);
			socket.emit('addToChat','To ' + data.username + ':' + data.message);
		}
	});
	socket.emit('init',{
		selfId:socket.id,
		player:Player.getAllInitPack(),
		})
}
Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack());
	return players;
}
 
Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
	removePack.player.push(socket.id);
}
Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		pack.push(player.getUpdatePack());		
	}
	return pack;
}
//var displayPack = {}
 var result = function(){
	/*Player.list[Object.keys(Player.list)[0]].ch = 'a'; player1, player2
	Player.list[Object.keys(Player.list)[1]].ch = 'a';*/
	if(Object.keys(Player.list).length>=2){
	var p1 = Player.list[Object.keys(Player.list)[0]];
	var p2 = Player.list[Object.keys(Player.list)[1]]; }
	else
	return;

	var win = "";

	if(!(p1.turn == 1 && p2.turn == 1))
	return;

	 

	p1.turn = 0;
	p2.turn = 0;
//p1.ch = player1.ch;
//p2.ch = player2.ch;
	
	if (
		(p1.ch === "s" && p2.ch === "p") ||
		(p1.ch === "p" && p2.ch === "r") ||
		(p1.ch === "r" && p2.ch === "l") ||
		(p1.ch === "l" && p2.ch === "S") ||
		(p1.ch === "S" && p2.ch === "s") ||
		(p1.ch === "s" && p2.ch === "l") ||
		(p1.ch === "l" && p2.ch === "p") ||
		(p1.ch === "p" && p2.ch === "S") ||
		(p1.ch === "S" && p2.ch === "r") ||
		(p1.ch === "r" && p2.ch === "s")
	  ) {
		// user 1 won
		p1.score ++;
		win = p1.username;
	  } else if (p1.ch === p2.ch/*
		(p1.ch === "r" && p2.ch === "r") ||
		(p1.ch === "s" && p2.ch === "s") ||
		(p1.ch === "p" && p2.ch === "p") ||
		(p1.ch === "l" && p2.ch === "l") ||
		(p1.ch === "s" && p2.ch === "S")*/
	  ) {
		// tie, s one won.
		win = 'Tie';
	  } else {
		// user 2 won.
		p2.score ++;
		win = p2.username;
		//return 'p2.ch';
	  }
	  

	return {
		name1:p1.username,
		name2:p2.username,
		ch1:p1.ch,
		ch2:p2.ch,
		win:win,
		score1:p1.score,
		score2:p2.score,

	}
	  //document.getElementById("result2").innerHTML = "Player 2 wins";
	 // document.getElementById("score").innerHTML =
		//"Score: " + p1.chw + " - " + p2.chw;
	}

var DEBUG = true;
 
var isValidPassword = function(data,cb){
	return cb(true);
	db.account.find({username:data.username,password:data.password},function(err,res){
		if(res.length > 0)
			cb(true);
		else
			cb(false);
	});
}
var isUsernameTaken = function(data,cb){
	return cb(false);
	db.account.find({username:data.username},function(err,res){
		if(res.length > 0)
			cb(true);
		else
			cb(false);
	});
}
var addUser = function(data,cb){
	cb();
	db.account.insert({username:data.username,password:data.password},function(err){
		cb();
	});
}

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
 
	socket.on('signIn',function(data){
		isValidPassword(data,function(res){
			if(res){
				Player.onConnect(socket, data.username);
				socket.emit('signInResponse',{success:true});
			} else {
				socket.emit('signInResponse',{success:false});			
			}
		});
	});
	socket.on('signUp',function(data){
		isUsernameTaken(data,function(res){
			if(res){
				socket.emit('signUpResponse',{success:false});		
			} else {
				addUser(data,function(){
					socket.emit('signUpResponse',{success:true});					
				});
			}
		});		
	});
 
 
	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});

 
	socket.on('evalServer',function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);		
	});
 
 
 
});
 
var initPack = {player:[]};
var removePack = {player:[]};


setInterval(function(){

	var pack = {
		player:Player.update(),
			}
/*	var pack2 = {
		//name1:Player.list[Object.keys(Player.list)[0]].username,
		//name2:Player.list[Object.keys(Player.list)[1]].username,
		ch1:Player.list[Object.keys(Player.list)[0]].ch,
		ch2:Player.list[Object.keys(Player.list)[1]].ch,
	}*/
	var resultPack = result();
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('init',initPack);
		socket.emit('update',pack);
		//socket.emit('result', {result:result()}); //socket.list[Object.keys(socket.list)[0]],socket.list[Object.keys(socket.list)[1]]
		socket.emit('display', resultPack);
		socket.emit('remove',removePack);
	}
	initPack.player = [];
	removePack.player = [];

},1000);