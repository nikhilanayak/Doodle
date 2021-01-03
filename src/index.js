var app = require("express")();
var http = require("http").createServer(app);
const io = require("socket.io")(http, {
	pingTimeout: 5000,
	wsEngine: "ws"
});

var sentencer = require("sentencer");
const getRandomWord = () => { // gets a random word
	return sentencer.make("{{ noun }}");
};

let currentWord = getRandomWord(); // keeps track of the current word
let gameIsRunning = false; // keeps track of the game state
let strokes = []; // an array of lines, each of which contain points of a line, color, and stroke width
let usernames = {}; // keeps track of users where key is socket ID and value is username
let drawingPlayer = undefined; // keeps track of the current player who has access to draw to the canvas

const colors = {
	red: 0,
	orange: 1,
	yellow: 2,
	green: 3,
	blue: 4,
	purple: 5,
	black: 6,
	white: 7,
	eraser: 8,
};


app.get("*", (req, res) => { //used to request static files
	res.sendFile(req.path, { "root": "./public/build" });
});


io.on("connection", (socket) => {
	socket.emit("init", { strokes: strokes }); // send the new player the data of the canvas to keep it up to date

	socket.on("disconnect", () => {
		// when a player disconnects, removes them from the usernames and prematurely ends the game
		delete usernames[socket.id];
		io.emit("players", { players: usernames });
		if (gameIsRunning) {
			io.emit("midgameleave");
			io.emit("resetboard");
			strokes = [];
			gameIsRunning = false;
		}
	});
	socket.on("click", (message) => { // called when a player creates a line on the canvas
		if (
			Object.keys(usernames).includes(socket.id) && // make sure the player is valid
            typeof message.ax == "number" && // make sure all values are valid
            typeof message.ay == "number" &&
            typeof message.bx == "number" &&
            typeof message.by == "number" &&
            typeof message.color == "number" &&
            typeof message.strokeWidth == "number" &&
            socket.id == drawingPlayer // make sure the player has access to draw on the canvas
		) {

			// converts colors to RGB values
			if (message.color == colors.red) {
				message.color = [255, 0, 0];
			} else if (message.color == colors.orange) {
				message.color = [255, 165, 0];
			} else if (message.color == colors.yellow) {
				message.color = [255, 255, 0];
			} else if (message.color == colors.green) {
				message.color = [0, 255, 0];
			} else if (message.color == colors.blue) {
				message.color = [0, 0, 255];
			} else if (message.color == colors.purple) {
				message.color = [80, 0, 80];
			} else if (message.color == colors.white) {
				message.color = [255, 255, 255];
			} else if (message.color == colors.black) {
				message.color = [0, 0, 0];
			} else if (message.color == colors.eraser) {
				message.color = [200, 200, 200];
			} else {
				return;
			}


			strokes.push(message); // add the new stroke to the master list so new players will stay up to date
			io.emit("click", message); // emit the message to all of the clients
		}
	});

	socket.on("guess", (message) => { // called when a player makes a guess
		if (
			Object.keys(usernames).includes(socket.id) && // make sure the player is valid
            message.word.trim().toLowerCase() == currentWord && // make sure the word is correct
            socket.id != drawingPlayer // make sure the player who guessed is not the player who is drawing
		) {
			io.emit("winner", { winner: usernames[socket.id], word: currentWord }); // tell all clients someone has one
			io.emit("resetboard"); // reset the board
			strokes = []; // reset the global strokes array
			drawingPlayer = undefined; // removes all rights to draw on the canvas until the game gets started again
			gameIsRunning = false; // stops the game internally so other logic works properly(eg. start button)
		}
	});

	socket.on("startgame", () => { // called when a player presses the "Start Game" button
		if (gameIsRunning || !Object.keys(usernames).includes(socket.id)) { // don't start the game if the player is invalid or the game is already running
			return;
		}
		if (Object.keys(usernames).length <= 1) { // the game cannot run if there is only 1 player
			io.emit("notenoughplayers"); // tell the players there aren't enough players
			return;
		}
		// if we're in here, the game is valid to start
		startGame(); // call startGame to initialize variables and emit the correct data to the clients
	});

	socket.on("ehlo", (message) => { // ehlo is called after a player inputs a username in the prompt
		usernames[socket.id] = message.username; // add the player to the global usernames object
		io.emit("players", { players: usernames }); // update all players with the new players list
	});

});

function startGame() {
	strokes = []; // reset the server's global strokes list
	currentWord = getRandomWord(); // request a new noun
	let drawingPlayerIndex = Math.trunc(Math.random() * Object.keys(usernames).length); // the index of a random player
	let drawingPlayerID = Object.keys(usernames)[drawingPlayerIndex]; // the ID of a random player
	drawingPlayer = drawingPlayerID; // set the drawingPlayer to the new random player
	io.to(drawingPlayerID).emit("startgame", { drawer: true, word: currentWord }); // tell the drawing player the word
	for (let id of Object.keys(usernames)) {
		// tell all other players the player drawing and the length of the word
		if (id != drawingPlayerID) {
			io.to(id).emit("startgame", { drawer: false, drawingPlayer: usernames[drawingPlayerID], wordLength: currentWord.length });
		}
	}
	gameIsRunning = true;
}


http.listen(process.env.PORT || 80, () => { // run the server on port 80 or $PORT
	console.log("listening on *:80");
});