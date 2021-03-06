var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});

var serveRoot = "\\";
var servePort;

var args = process.argv;
if(args.length>2){
	serveRoot = args[2];
}
if(args.length>3){
	servePort = args[3];
}


var port = process.env.PORT || (servePort?servePort:3002)
//var webroot = __dirname;
var webroot = __dirname + '/' + serveRoot;

app.use(express.static(webroot))
var server = http.createServer(app)
server.listen(port)

console.log("http serving:"+webroot+" on port %d", port)

var playerIdBase=0;
var connections = [];


var wss = new WebSocketServer({server: server})
console.log("websocket server created")


wss.on("connection", function(ws) {
	ws.playerId = playerIdBase++;
	console.log("websocket connection open:",ws.playerId)
	ws.on("close", function() {
		console.log("websocket connection closed:",ws.playerId)
	})

	ws.on("message",function(msg){
		try{
			//console.log("Got message from:",ws.playerId," : ",msg)
			data.obj = ws.playerId;	//slam playerID
			if(data.restartServer)
				setTimeout(function(){//Cause the server to restart....
					console.log("Restarting server....");
					process.exit(0);
				},1000);
		}
		catch(e){
			console.log("Got malformed data from client:",ws.playerId,JSON.stringify(msg));
		}
	});
})
