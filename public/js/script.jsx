var App = React.createClass({
  getInitialState: function () {
    return {
      word: "",
      success: [],
      fails: []
    };
  },
  componentDidMount: function () {
    document.addEventListener("keydown", this.handleKeydown);
    this.socket.on("newWord", this.setWord);
  },
  socket: io(),
  getWord: function () {
    this.socket.emit("getWord");
  },
  setWord: function (word) {
    var state = this.getInitialState();
        state.word = word;

    this.setState(state);
  },
  handleKeydown: function (e) {
    var charCode = e.which || e.keyCode;
    var char = String.fromCharCode(charCode).toLowerCase();

    if (charCode >= 65 && charCode <= 90 && // key actually has letter
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
  },
  failed: function (char) {
    this.state.fails.push(char);
    this.setState({fails: this.state.fails});
  },
  render: function () {

    return <div id="app">
      <div>
        {this.state.word}
        <div onClick={this.getWord}>Reset</div>
      </div>

      <div className="fails">
        <div className="title">You missed:</div>
        <div className="chars">{
          this.state.fails.map(function (char) {
            return <div className="char">{char}</div>;
          })
        }</div>
      </div>

      <div className="success">
        <div className="title"></div>
        <div className="chars">{
          this.state.success.map(function (char) {
            return <div className="char">{char}</div>;
          })
        }</div>
      </div>
    </div>;
  }
});

React.render(<App />, document.body);