var App = React.createClass({
  getInitialState: function () {
    var _this = this;
    var state = {
      word: "",
      success: [],
      fails: [],
      game: false
    };

    Object.defineProperty(state.success, "rule", {
      enumerable: false,
      get: function(){
        return new RegExp("[^- " + this.join("") + "]", "g");
      }
    });

    Object.defineProperty(state.success, "content", {
      enumerable: false,
      get: function(){
        var word = _this.state.word;
        var success = [];
        var known = word.replace(this.rule, "_");
            known = Array(12 - word.length).join(" ") + known;

        for (var i in known) {
          var char = known[i];
          var classes = "char ";
          classes += this.indexOf(char) >= 0 ? "known" : char === "_" ? "unknown" : "disabled";

          success[i] = <div className={classes}>{char}</div>;
        }
        return success;
      }
    });

    Object.defineProperty(state.fails, "content", {
      enumerable: false,
      get: function(){
        return this.map(function (char) {
          return <div className="char">{char}</div>;
        });
      }
    });

    return state;
  },
  componentDidMount: function () {
    document.addEventListener("keydown", this.handleKeydown);
    this.socket.on("newWord", this.setWord);
  },
  socket: io(),
  getWord: function () {
    this.socket.emit("getWord");
    this.refs.scene.setState(this.refs.scene.getInitialState());
  },
  setWord: function (word) {
    var state = this.getInitialState();
        state.word = word.toLowerCase();
        state.game = true;

    this.setState(state);
  },
  handleKeydown: function (e) {
    var charCode = e.which || e.keyCode;
    var char = String.fromCharCode(charCode).toLowerCase();

    if (this.state.game &&
      charCode >= 65 && charCode <= 90 && // key actually has letter
      this.state.success.indexOf(char) < 0 && this.state.fails.indexOf(char) < 0) { // key not used before
      if (this.state.word.indexOf(char) >= 0) {
        this.succeed(char);
      }
      else {
        this.failed(char);
      }
    }
  },
  succeed: function (char) {
    this.state.success.push(char);
    this.setState({success: this.state.success});

    this.checkStatus();
  },
  failed: function (char) {
    this.refs.scene.draw(this.state.fails.length);
    this.state.fails.push(char);
    this.setState({fails: this.state.fails});

    this.checkStatus();
  },
  checkStatus: function () {
    //console.log(this.state.success);
    //console.log(this.state.success.length);
    //console.log(this.state.word);
    //console.log(this.state.word.length);

    if (this.state.success.length === this.state.word.length ||
      this.state.fails.length === this.refs.scene.state.layers.length) {
      this.setState({game: false});
    }
  },
  render: function () {
    return <div id="app" className={this.state.game ? "playing" : "stopped"}>
      <div className="fails">
        <div className="title">You missed:</div>
        <div className="chars">{this.state.fails.content}</div>
      </div>

      <Scene ref="scene"/>

      <div className="success">
        <div className="chars">{this.state.success.content}</div>
      </div>

      <div className="curtain">
        <div>
          <div className="title">Game over</div>
          <div className="reset" onClick={this.getWord}>New word</div>
        </div>
      </div>

      <div className="scuare"></div>
    </div>;
  }
});

var Scene = React.createClass({
  componentDidMount: function () {
    setTimeout(function () {
      var domEl = this.refs.hangman.getDOMNode();
          domEl.setAttribute("class", "painted");
    }.bind(this), 200);
  },
  draw: function (indx) {
    this.state.layers[indx].painted = true;
    this.setState({layers: this.state.layers});
  },
  getInitialState: function () {
    return {
      layers: [
        {
          name: "head",
          layerIndx: 10,
          painted: false,
          layers: [
            {
              name: "skull",
              path: "M 126,141 C 126,90 176,56 223,73 248,82 269,109 270,137 270,137 270,152 270,152 277,152 282,152 287,157 297,165 295,180 284,186 279,189 275,189 270,189 270,213 271,232 255,253 243,268 222,280 203,281 203,281 192,281 192,281 170,280 145,262 135,244 125,225 127,209 127,189 121,189 116,189 111,186 101,179 99,165 108,157 114,152 119,152 127,152 125,147 125,145 126,141 Z"
            },
            {
              name: "hair",
              path: "M 126,142 C 125,128 129,115 136,104 139,98 142,93 148,91 150,105 143,124 138,137 135,143 132,149 126,153 126,153 126,142 126,142 Z M 259,104 C 270,121 270,134 270,153 263,148 262,144 258,138 252,125 245,104 248,91 253,93 256,98 259,104 Z M 137,189 C 139,191 140,200 148,202 151,203 158,201 162,199 162,199 189,191 189,191 191,205 202,204 206,197 207,195 207,192 208,190 208,190 245,198 245,198 247,199 250,198 252,196 256,192 253,189 261,189 262,188 266,188 268,190 270,191 269,194 270,197 270,197 270,212 270,212 269,240 251,264 226,275 216,279 214,280 204,281 187,281 185,282 170,275 164,272 160,270 156,267 138,254 127,233 127,212 127,212 127,189 127,189 129,189 135,188 137,189 Z"
            },
            {
              name: "ears",
              path: "M 127,173 C 126,175 127,178 124,179 121,180 116,176 115,172 114,167 118,163 121,161 128,161 127,168 127,173 Z M 270,180 C 270,180 270,162 270,162 284,162 284,179 270,180 Z"
            },
            {
              name: "mouth",
              path: "M 185,212 C 194,202 213,205 215,224 215,224 181,224 181,224 181,219 182,215 185,212 Z"
            },
            {
              name: "eyes",
              path: "M 168,175 C 161,176 154,168 164,162 175,160 176,173 168,175 Z M 232,175 C 225,176 218,168 228,162 239,160 240,173 232,175 Z"
            },
            {
              name: "deco",
              path: "M 278,191 C 276,193 271,190 275,186 281,184 281,190 278,191 Z M 175,221 C 173,223 168,220 172,216 178,214 178,220 175,221 Z"
            },
            {
              name: "scar",
              path: "M 155,108 C 155,108 153,112 153,112 153,112 153,116 153,116 153,116 159,122 159,122 159,122 160,124 160,124 160,124 159,125 159,125 159,125 159,127 159,127 159,127 159,129 159,129 159,129 160,130 160,130 160,130 165,130 165,130"
            }
          ]
        },
        {
          layerIndx: 9,
          painted: false,
          layers: [
            {
              name: "neck",
              path: "M 221,275 C 221,275 221,291 221,291 220,293 221,295 219,297 217,298 214,298 212,299 205,300 198,300 192,300 188,299 178,299 176,297 174,295 175,291 175,289 175,289 175,275 175,275 175,275 221,275 221,275 Z"
            }
          ]
        },
        {
          name: "corpus",
          layerIndx: 8,
          painted: false,
          layers: [
            {
              name: "corpus-left",
              path: "M 147,313 C 147,300 154,297 166,297 166,297 198,297 198,297 198,297 198,419 198,419 198,419 147,419 147,419 147,419 147,313 147,313 Z"
            },
            {
              name: "corpus-right",
              path: "M 225,297 C 229,297 236,296 241,297 249,300 251,305 252,314 252,314 252,419 252,419 252,419 198,419 198,419 198,419 198,297 198,297 198,297 225,297 225,297 Z"
            },
            {
              name: "corpus-pants",
              path: "M 252,419 C 252,419 252,449 252,449 252,449 254,462 254,462 254,462 145,462 145,462 145,462 146,453 146,453 146,453 146,419 146,419 146,419 252,419 252,419 Z"
            }
          ]
        },
        {
          layerIndx: 1,
          painted: false,
          layers: [
            {
              name: "left-arm",
              path: "M 147,315 C 148,332 147,363 147,363 148,368 144,371 137,379 137,379 117,398 117,398 112,402 99,416 95,418 92,419 90,419 88,418 84,417 82,415 80,412 74,407 61,397 64,389 65,385 68,382 71,380 71,380 85,366 85,366 85,366 126,325 126,325 131,319 147,302 154,298 154,298 148,302 147,315 Z"
            }
          ]
        },
        {
          layerIndx: 0,
          painted: false,
          layers: [
            {
              name: "left-hand",
              path: "M 85,401 C 92,409 88,422 78,425 59,430 50,403 70,396 75,395 81,396 85,401 Z"
            }
          ]
        },
        {
          layerIndx: 3,
          painted: false,
          layers: [
            {
              name: "right-arm",
              path: "M 277,330 C 277,330 316,369 316,369 316,369 331,384 331,384 333,386 336,389 337,393 337,397 335,400 332,404 326,410 316,424 307,421 302,420 297,414 294,411 294,411 270,387 270,387 266,384 254,373 250,369 250,361 250,339 251,321 253,302 244,299 244,299 251,305 269,322 277,330 Z"
            }
          ]
        },
        {
          layerIndx: 2,
          painted: false,
          layers: [
            {
              name: "right-hand",
              path: "M 339,403 C 346,411 342,424 332,427 313,432 304,405 324,398 329,397 335,398 339,403 Z"
            }
          ]
        },
        {
          layerIndx: 5,
          painted: false,
          layers: [
            {
              name: "left-leg",
              path: "M 194,461 C 194,461 185,504 185,504 185,504 167,586 167,586 167,586 161,615 161,615 158,620 155,622 150,622 150,622 140,620 140,620 130,618 113,617 114,605 114,605 124,558 124,558 124,558 145,461 145,461 145,461 194,461 194,461 Z"
            }
          ]
        },
        {
          layerIndx: 4,
          painted: false,
          layers: [
            {
              name: "left-foot",
              path: "M 127,607 C 127,607 146,610 146,610 149,612 150,615 151,618 154,625 155,635 145,637 142,637 134,636 131,636 131,636 102,632 102,632 97,631 82,630 79,628 71,624 72,610 77,605 79,603 80,603 83,602 83,602 127,607 127,607 Z"
            }
          ]
        },
        {
          layerIndx: 7,
          painted: false,
          layers: [
            {
              name: "right-leg",
              path: "M 254,461 C 254,461 274,558 274,558 274,558 284,605 284,605 285,617 268,618 259,620 259,620 249,622 249,622 243,622 240,620 237,615 237,615 231,586 231,586 231,586 213,504 213,504 213,504 204,461 204,461 204,461 254,461 254,461 Z"
            }
          ]
        },
        {
          layerIndx: 6,
          painted: false,
          layers: [
            {
              name: "right-foot",
              path: "M 317,627 C 314,630 304,630 300,631 300,631 268,635 268,635 263,636 252,638 249,637 242,635 240,630 241,624 241,620 243,613 246,611 248,610 260,609 264,608 264,608 280,606 280,606 280,606 310,602 310,602 323,603 323,622 317,627 Z"
            }
          ]
        }
      ]
    }
  },
  render: function () {

    var svgContent = [];
    for (var i in this.state.layers) {
      svgContent[this.state.layers[i].layerIndx] = <Layer data={this.state.layers[i]}/>;
    }

    return <div id="scene">
      <svg>
        <g ref="hangman">
          <path className="hangman"
                d="M 224.00,3.00 C 228.30,3.01 233.21,2.86 236.78,5.70 242.34,10.13 242.50,24.67 237.58,29.58 232.71,34.46 217.85,33.00 211.00,33.00 211.00,33.00 211.00,64.00 211.00,64.00 210.98,67.70 210.98,71.65 208.91,74.89 204.79,81.38 189.62,81.79 184.42,76.58 181.34,73.51 181.05,69.08 181.00,65.00 181.00,65.00 181.00,33.00 181.00,33.00 181.00,33.00 0.00,33.00 0.00,33.00 0.00,33.00 0.00,3.00 0.00,3.00 0.00,3.00 224.00,3.00 224.00,3.00 Z"/>
        </g>
        {svgContent}
      </svg>
    </div>
  }
});

var Layer = React.createClass({
  render: function () {
    var classes = this.props.name || "";
        classes += this.props.data.painted ? " painted" : "";

    return <g className={classes}>{
      this.props.data.layers.map(function (layer) {
        return <path className={layer.name} d={layer.path}/>;
      })
    }</g>;
  }
});

React.render(<App />, document.getElementById("wrapper"));