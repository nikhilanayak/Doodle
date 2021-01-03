import React from "../web_modules/react.js";
import {Button, Snackbar, SnackbarContent, TextField, Slider} from "../web_modules/@material-ui/core.js";
import {withStyles} from "../web_modules/@material-ui/core/styles.js";
import Sketch from "../web_modules/react-p5.js";
import socketio from "../web_modules/socket.io-client.js";
import "./App.css.proxy.js";
let strokes = [];
let playerList = "";
let inputValue = void 0;
const socket = socketio();
var playerStates;
(function(playerStates2) {
  playerStates2[playerStates2["guesser"] = 0] = "guesser";
  playerStates2[playerStates2["drawer"] = 1] = "drawer";
})(playerStates || (playerStates = {}));
;
var colors;
(function(colors2) {
  colors2[colors2["red"] = 0] = "red";
  colors2[colors2["orange"] = 1] = "orange";
  colors2[colors2["yellow"] = 2] = "yellow";
  colors2[colors2["green"] = 3] = "green";
  colors2[colors2["blue"] = 4] = "blue";
  colors2[colors2["purple"] = 5] = "purple";
  colors2[colors2["black"] = 6] = "black";
  colors2[colors2["white"] = 7] = "white";
  colors2[colors2["eraser"] = 8] = "eraser";
})(colors || (colors = {}));
;
const styles = () => ({
  multilineColor: {
    color: "white"
  }
});
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {snackbarData: void 0, headerData: void 0, playerState: void 0, currentWord: void 0, drawingPlayer: void 0, currentColor: 6, wordLength: void 0, strokeWidth: 5};
    const {classes} = props;
    this.classes = classes;
    this.handleSliderChange = this.handleSliderChange.bind(this);
    this.setup = (p5, canvasParentRef) => {
      console.log("created canvas");
      p5.createCanvas(500, 500).parent(canvasParentRef);
    };
    this.draw = (p5) => {
      p5.background(200, 200, 200);
      p5.stroke(128);
      p5.strokeWeight(5);
      if (p5.mouseIsPressed && p5.mouseX <= 500 && p5.mouseX >= 0 && p5.mouseY <= 500 && p5.mouseY >= 0 && p5.pmouseX <= 500 && p5.pmouseX >= 0 && p5.pmouseY <= 500 && p5.pmouseY >= 0) {
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
      socket.emit("ehlo", {username});
    });
    socket.on("players", (message) => {
      playerList = "Players: " + Object.values(message.players).toString();
      this.setState(this.state);
    });
    socket.on("startgame", (message) => {
      strokes = [];
      if (message.drawer) {
        const state = {...this.state};
        state.playerState = 1;
        state.currentWord = message.word;
        this.setState(state);
      } else {
        let drawingPlayer = message.drawingPlayer;
        const state = {...this.state};
        state.playerState = 0;
        state.drawingPlayer = drawingPlayer;
        state.wordLength = message.wordLength;
        this.setState(state);
      }
    });
    socket.on("resetboard", () => {
      strokes = [];
    });
    socket.on("winner", (message) => {
      let state = {...this.state};
      state.snackbarData = `${message.winner} guessed the word, ${message.word}`;
      state.playerState = void 0;
      this.setState(state);
    });
    socket.on("midgameleave", () => {
      let state = {...this.state};
      state.snackbarData = "One Or More Players Left This Round So The Game Has Been Ended";
      state.playerState = void 0;
      this.setState(state);
    });
    socket.on("notenoughplayers", () => {
      let state = {...this.state};
      state.snackbarData = "Not Enough Players";
      this.setState(state);
    });
  }
  setColor(color) {
    console.log("changed color");
    const state = {...this.state};
    state.currentColor = color;
    this.setState(state);
    console.log(this.state.currentColor);
  }
  handleSliderChange(event, newValue) {
    const state = {...this.state};
    state.strokeWidth = newValue;
    this.setState(state);
  }
  render() {
    return /* @__PURE__ */ React.createElement("div", {
      className: "App"
    }, /* @__PURE__ */ React.createElement("header", {
      className: "App-header"
    }, this.state.playerState == 1 && /* @__PURE__ */ React.createElement("h1", null, "You Are Drawing! Your Word Is: ", this.state.currentWord), this.state.playerState == 0 && /* @__PURE__ */ React.createElement("h1", null, "You Are Guessing! Guess What ", this.state.drawingPlayer, " Is Drawing", /* @__PURE__ */ React.createElement("br", null), "_ ".repeat(this.state.wordLength)), /* @__PURE__ */ React.createElement("h3", null, playerList.toString()), this.state.playerState == void 0 && /* @__PURE__ */ React.createElement(Button, {
      variant: "contained",
      color: "primary",
      onClick: () => {
        socket.emit("startgame");
      }
    }, "Start Game"), /* @__PURE__ */ React.createElement(Sketch, {
      setup: this.setup,
      draw: this.draw
    }), this.state.playerState == 1 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", {
      style: {float: "left", display: "flex"}
    }, /* @__PURE__ */ React.createElement("div", {
      style: {cursor: "pointer", width: 20, height: 20, backgroundColor: "red"},
      onClick: () => {
        this.setColor(0);
      }
    }), /* @__PURE__ */ React.createElement("div", {
      style: {cursor: "pointer", width: 20, height: 20, backgroundColor: "orange"},
      onClick: () => {
        this.setColor(1);
      }
    }), /* @__PURE__ */ React.createElement("div", {
      style: {cursor: "pointer", width: 20, height: 20, backgroundColor: "yellow"},
      onClick: () => {
        this.setColor(2);
      }
    }), /* @__PURE__ */ React.createElement("div", {
      style: {cursor: "pointer", width: 20, height: 20, backgroundColor: "green"},
      onClick: () => {
        this.setColor(3);
      }
    }), /* @__PURE__ */ React.createElement("div", {
      style: {cursor: "pointer", width: 20, height: 20, backgroundColor: "blue"},
      onClick: () => {
        this.setColor(4);
      }
    }), /* @__PURE__ */ React.createElement("div", {
      style: {cursor: "pointer", width: 20, height: 20, backgroundColor: "purple"},
      onClick: () => {
        this.setColor(5);
      }
    }), /* @__PURE__ */ React.createElement("div", {
      style: {cursor: "pointer", width: 20, height: 20, backgroundColor: "black"},
      onClick: () => {
        this.setColor(6);
      }
    }), /* @__PURE__ */ React.createElement("div", {
      style: {cursor: "pointer", width: 20, height: 20, backgroundColor: "white"},
      onClick: () => {
        this.setColor(7);
      }
    }), /* @__PURE__ */ React.createElement("div", {
      style: {cursor: "pointer", width: 20, height: 20, backgroundColor: "#C8C8C8"},
      onClick: () => {
        this.setColor(8);
      }
    })), /* @__PURE__ */ React.createElement(Slider, {
      value: this.state.strokeWidth,
      onChange: this.handleSliderChange
    })), this.state.playerState == 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(TextField, {
      spellCheck: "false",
      InputProps: {className: this.classes.multilineColor},
      variant: "filled",
      id: "guess",
      onChange: (e) => inputValue = e.target.value
    }), /* @__PURE__ */ React.createElement(Button, {
      variant: "contained",
      color: "primary",
      id: "submitGuess",
      onClick: () => {
        socket.emit("guess", {word: inputValue});
        console.log("iv", inputValue);
      }
    }, "Submit Guess")), /* @__PURE__ */ React.createElement(Snackbar, {
      autoHideDuration: 6e3,
      open: this.state.snackbarData != void 0,
      onClose: () => {
        const state = {...this.state};
        state.snackbarData = void 0;
        this.setState(state);
      }
    }, /* @__PURE__ */ React.createElement(SnackbarContent, {
      message: this.state.snackbarData
    }))));
  }
}
export default withStyles(styles, {withTheme: true})(App);
