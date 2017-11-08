import React, { Component } from 'react';
import './App.css';

const N = 15

function Square(props) {
  return (
    <button className="square" onClick={props.Clk} style={{background: props.color}}>
      {props.val}
    </button>
  );
}

function Reset(props) {
  return (
    <button onClick={props.Clk}>
      reset
    </button>
  )
}

class Board extends React.Component {
  constructor() {
    super()
    this.state = {
      winlist: [],
      order: N,
      msg: 'Next player: X',
      squares: [],
      xIsNext: true,
      over: false,
      wins: [],
      history: [],
      clkBtn: [],
    }
  }

  reset() {
    this.setState({
      winlist: [],
      msg: 'Next player: X',
      squares: Array(this.state.order * this.state.order).fill(null),
      xIsNext: true,
      over: false,
      history: [],
      clkBtn: [],
    })    
  }

  winItem(block) {
    let sideLength = 5
    let winRows = []
    let winCols = []
    let winCrossL = []
    let winCrossR = []
    for (let i = 0; i< sideLength; i++) {
      let wr = []
      let wc = []
      for (let j = 0; j<sideLength; j++) {
        wr.push(block[sideLength*i+j])
        wc.push(block[i+sideLength*j])
      }
      winCrossL.push(block[(sideLength+1)*i])
      winCrossR.push(block[(sideLength-1)*(i+1)])      
      winRows.push(wr)
      winCols.push(wc)
    }
    let wins = winRows.concat(winCols).concat([winCrossL, winCrossR])

    return wins
  }

  genWins(order) {
    let blocks = []
    let block0 = []
    for (let i = 0; i< 5; i++) {
      for (let j = 0; j< 5; j++) {
        block0.push(order*i+j)
      }
    }

    for (let i = 0; i< order-4; i++) {
      for (let j = 0; j< order-4; j++) {
        blocks.push(block0.map((item) => {return item + i + order*j}) )
      }
    }
    let wins = blocks.length > 0 ? blocks.map((block) => {return this.winItem(block)})
                                         .reduce((pre, cur) => {return pre.concat(cur)}) : []
    return wins
  }

  componentWillMount() {
    this.setState({
      squares: Array(this.state.order * this.state.order).fill(null),
      wins: this.genWins(this.state.order),
    })
  }

  isWin(squares) {
    let status = 0
    let list_x = []
    let list_o = []
    for (let s in squares) {
      if (squares[s] === 'X') {
        list_x.push(parseInt(s, 10))
      } else if (squares[s] === 'O'){
      list_o.push(parseInt(s, 10))
      }
    }
    for (let win of this.state.wins) {
      if (this.isSubset(win, list_x)) {
        status = 1
        this.setState({winlist: win})
      }
      if (this.isSubset(win, list_o)) {
        status = 2
        this.setState({winlist: win})
      }
    }
    if (status === 0 && list_x.length + list_o.length === (this.state.order * this.state.order)) {
      status = 9
    }
    return status
  } 

  isSubset(array_a, array_b) {
    for (let i of array_a) {
      if (array_b.indexOf(i) === -1) {
        return false
      }
    }
    return true
  }

  renderSquare(i) {
    return (
      <Square 
        val = {this.state.squares[i]} 
        color = {this.state.winlist.indexOf(i) > -1 ? 'red' : 'white'}
        Clk = {() => this.handleClick(i)}
        key = {i}
      />
    );
  }

  handleClick(i) {
    let squ_new = this.state.squares.slice()
    let nh = this.state.history.slice()
    let cb = this.state.clkBtn.slice()
    nh.push(squ_new)

    if (squ_new[i] || this.state.over) {
      return
    }

    squ_new[i] = this.state.xIsNext ? 'X' : 'O'
    cb.push([i, squ_new[i]])
    this.setState({
      squares: squ_new,
      xIsNext: !this.state.xIsNext,
      history: nh,
      clkBtn: cb,
    })

    let res = this.isWin(squ_new)
    if (res === 1 || res === 2) {
      this.setState({over: true})
      let winner = res === 1 ? 'X' : 'O'
      this.setState({msg: 'winner is ' + winner}) 
    } else if (res === 0) {
      this.setState({msg: 'Next player: ' + (!this.state.xIsNext ? 'X' : 'O')})
    } else if (res === 9) {
      this.setState({msg: 'dogfall!!'})
    }    
  }

  genRow(sideLength, i) {
    let s = []
    for (let j = 0; j<sideLength; j++){
      s.push(this.renderSquare(j + sideLength*i))
    }
    return s
  }

  recover(index) {
    let now = this.state.history[index]
    let next = this.state.clkBtn[index][1] === 'X' ? 'O' : 'X'
    let xIsNext = next === 'X' ? true : false

    this.setState({
      winlist: [],
      msg: 'Next player: ' + next,
      squares: now,
      xIsNext: xIsNext,
      over: false,
    })
  }

  render() {
    let sideLength = this.state.order
    let Rows = () => {
      let res = []
      for (let i = 0; i< sideLength; i++) {
        res.push(<div className="board-row" key={i}>   
          {this.genRow(sideLength, i)}
        </div>)
      }
      return res
    }

    let Bts = () => {
      let res = this.state.history.length > 0 && this.state.winlist.length === 0 ? this.state.history.map((h, index) => {
        return (<p key={index}>
                  <button onClick={this.recover.bind(this, index)}>
                    第{index + 1}步: {this.state.clkBtn[index][1]} {parseInt(this.state.clkBtn[index][0]/this.state.order, 10)+1}行 {(this.state.clkBtn[index][0] % this.state.order) +1}列
                  </button>
                </p>)
      }) : null
      return res
    } 

    return (
      <div>
        <Reset Clk={() => this.reset()}/>
        <div className="status">{this.state.msg}</div>
          {Rows()}
          {Bts()}
      </div>
    );
  }
}


class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}


class App extends Component {
  render() {
    return (
      <Game />
    );
  }
}

export default App;
