var App = React.createClass({
  getInitialState: function () {
    return {
      word: ""
    };
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
  componentDidMount: function () {
    this.socket.on("newWord", this.setWord);
  },
  render: function () {
    return <div>
      {this.state.word}
      <div onClick={this.getWord}>Reset</div>
    </div>;
  }
});

React.render(<App />, document.body);