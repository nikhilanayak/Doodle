import React from "react";
import { Button, Snackbar, SnackbarContent, TextField, Slider } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

import Sketch from "react-p5";
import socketio from "socket.io-client";
import "./App.css";

let strokes = [];
let playerList = "" ;
let inputValue = undefined;

const socket = socketio();

enum playerStates{
	guesser,
	drawer
};

enum colors{
	red,
	orange,
	yellow,
	green,
	blue,
	purple,
	black,
	white,
	eraser
};

const styles = () => ({
	multilineColor: {
		color: "white"
	}
});
interface stylesInterface{
	multilineColor: string
}

interface AppProps{

}
interface AppState{
	snackbarData: string,
	headerData: string,
	playerState: playerStates,
	currentWord: string,
	drawingPlayer: string,
	currentColor: colors,
	wordLength: number,
	strokeWidth: number

}


class App extends React.Component<AppProps, AppState>{

	classes: stylesInterface;
	setup: (p5: any, canvasParentRef: any) => void;
	draw: (p5: any) => void;

	constructor(props) {
		super(props);
		this.state = { snackbarData: undefined, headerData: undefined, playerState: undefined, currentWord: undefined, drawingPlayer: undefined, currentColor: colors.black, wordLength: undefined, strokeWidth: 5 };

		const { classes } = props;
		this.classes = classes as stylesInterface;

		this.handleSliderChange = this.handleSliderChange.bind(this);


		this.setup = (p5, canvasParentRef) => {
			console.log("created canvas");
			// use parent to render the canvas in this ref
			// (without that p5 will render the canvas outside of your component)
			p5.createCanvas(500, 500).parent(canvasParentRef);
		};
		this.draw = (p5) => {
			p5.background(200, 200, 200);
			p5.stroke(128);
			p5.strokeWeight(5);
			if (p5.mouseIsPressed &&
				p5.mouseX <= 500 && p5.mouseX >= 0 &&
				p5.mouseY <= 500 && p5.mouseY >= 0 &&
				p5.pmouseX <= 500 && p5.pmouseX >= 0 &&
				p5.pmouseY <= 500 && p5.pmouseY >= 0
			) {
				const mousePos = {
					ax: p5.pmouseX,
					ay: p5.pmouseY,
					bx: p5.mouseX,
					by: p5.mouseY,
					color: this.state.currentColor,
					strokeWidth: this.state.strokeWidth
				};

				socket.emit("click", mousePos);
			}

			for (let stroke of strokes) {
				p5.strokeWeight(stroke.strokeWidth);
				p5.stroke(stroke.color[0], stroke.color[1], stroke.color[2]);
				p5.line(stroke.ax, stroke.ay, stroke.bx, stroke.by);
			}

			p5.strokeWeight(2);
			p5.circle(p5.mouseX, p5.mouseY, this.state.strokeWidth);
		};

		socket.on("click", (message) => {
			strokes.push(message);
		});
		socket.on("init", (message) => {
			strokes = message.strokes;
			let username = null;
			while (!username) {
				username = prompt("What's Your Username?");
			}
			socket.emit("ehlo", { username: username });
		});
		socket.on("players", (message) => {
			playerList = "Players: " + Object.values(message.players).toString();
			this.setState(this.state);
		});
		socket.on("startgame", (message) => {
			strokes = [];
			if (message.drawer) {
				const state = { ...this.state };
				state.playerState = playerStates.drawer;
				state.currentWord = message.word;
				this.setState(state);
			} else {
				let drawingPlayer = message.drawingPlayer;
				const state = { ...this.state };
				state.playerState = playerStates.guesser;
				state.drawingPlayer = drawingPlayer;
				state.wordLength = message.wordLength;
				this.setState(state);
			}
		});

		socket.on("resetboard", () => {
			strokes = [];
		});

		socket.on("winner", (message) => {
			let state = { ...this.state };
			state.snackbarData = `${message.winner} guessed the word, ${message.word}`;
			state.playerState = undefined;
			this.setState(state);

		});

		socket.on("midgameleave", () => {
			let state = { ...this.state };
			state.snackbarData = "One Or More Players Left This Round So The Game Has Been Ended";
			state.playerState = undefined;
			this.setState(state);
		});

		socket.on("notenoughplayers", () => {
			let state = { ...this.state };
			state.snackbarData = "Not Enough Players";
			this.setState(state);
		});


	}


	setColor(color) {
		console.log("changed color");
		const state = { ...this.state };
		state.currentColor = color;
		this.setState(state);
		console.log(this.state.currentColor);
	}

	handleSliderChange(event, newValue) {
		const state = { ...this.state };
		state.strokeWidth = newValue;
		this.setState(state);
	}

	render() {

		return (<div className="App" >
			<header className="App-header" >

				{this.state.playerState == playerStates.drawer &&
					<h1>You Are Drawing! Your Word Is: {this.state.currentWord}</h1>
				}
				{this.state.playerState == playerStates.guesser &&
					<h1>
						You Are Guessing! Guess What {this.state.drawingPlayer} Is Drawing
						<br />
						{"_ ".repeat(this.state.wordLength)}
					</h1>
				}

				<h3>{playerList.toString()}</h3>

				{this.state.playerState == undefined &&
					<Button variant="contained" color="primary" onClick={() => { socket.emit("startgame"); }}>Start Game</Button>
				}
				<Sketch setup={this.setup} draw={this.draw}></Sketch>

				{this.state.playerState == playerStates.drawer &&
					<div>
						<div style={{ float: "left", display: "flex" }}>
							<div style={{ cursor: "pointer", width: 20, height: 20, backgroundColor: "red" }} onClick={() => { this.setColor(colors.red);}}></div>
							<div style={{ cursor: "pointer", width: 20, height: 20, backgroundColor: "orange" }} onClick={() => { this.setColor(colors.orange);}}></div>
							<div style={{ cursor: "pointer", width: 20, height: 20, backgroundColor: "yellow" }} onClick={() => { this.setColor(colors.yellow);}}></div>
							<div style={{ cursor: "pointer", width: 20, height: 20, backgroundColor: "green" }} onClick={() => { this.setColor(colors.green);}}></div>
							<div style={{ cursor: "pointer", width: 20, height: 20, backgroundColor: "blue" }} onClick={() => { this.setColor(colors.blue);}}></div>
							<div style={{ cursor: "pointer", width: 20, height: 20, backgroundColor: "purple" }} onClick={() => { this.setColor(colors.purple);}}></div>
							<div style={{ cursor: "pointer", width: 20, height: 20, backgroundColor: "black" }} onClick={() => { this.setColor(colors.black);}}></div>
							<div style={{ cursor: "pointer", width: 20, height: 20, backgroundColor: "white" }} onClick={() => { this.setColor(colors.white);}}></div>
							<div style={{ cursor: "pointer", width: 20, height: 20, backgroundColor: "#C8C8C8" }} onClick={() => { this.setColor(colors.eraser);}}></div>
						</div>
						<Slider value={this.state.strokeWidth} onChange={this.handleSliderChange}></Slider>
					</div>
				}

				{this.state.playerState == playerStates.guesser &&
					<div>
						<TextField spellCheck="false" InputProps={{ className: this.classes.multilineColor }} variant="filled" id="guess" onChange={e => inputValue = e.target.value} />
						<Button variant="contained" color="primary" id="submitGuess" onClick={() => {
							socket.emit("guess", { word: inputValue });
							console.log("iv", inputValue);
						}}>Submit Guess</Button>
					</div>

				}

				<Snackbar
					autoHideDuration={6000}
					open={this.state.snackbarData != undefined}
					onClose={() => {
						const state = { ...this.state };
						state.snackbarData = undefined;
						this.setState(state);
					}}
				>
					<SnackbarContent message={this.state.snackbarData} />
				</Snackbar>


			</header>
		</div>
		);
	}
}

export default withStyles(styles, { withTheme: true })(App);