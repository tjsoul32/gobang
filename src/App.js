import React, { Component } from 'react';
import './App.css';

const N = 19

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

function Reverse(props) {
  let odr = props.reverse ? "↑" : "↓"
  return (
    <button onClick={props.Clk}>
      reverse {odr}
    </button>
  )
}


class Board extends React.Component {
  constructor() {
    super()
    this.state = {
      winlist: [],
      loselist: [],
      order: N,
      msg: 'Next player: X',
      squares: [],
      xIsNext: true,
      over: false,
      wins: [],
      history: [],
      reverse: true,
    }
  }

  reset() {
    this.setState({
      winlist: [],
      loselist: [],
      msg: 'Next player: X',
      squares: Array(this.state.order * this.state.order).fill(null),
      xIsNext: true,
      over: false,
      history: [],
    })    
  }

  reverse() {
    this.setState({
      reverse: !this.state.reverse
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

    status = this.isOverline(list_x) ? 3 : status

    return status
  } 

  isOverline(list_x) {
    let lose = []
    let res = false
    var tmparray = new Array(6).fill(0)
    for (let x of list_x) {
      let s_r = 1
      let s_l = 1
      let s_c = 1
      for (let i = 1; i< 6; i++) {
        s_r = this.state.squares[x + i] === 'X' ? s_r : 0
        s_l = this.state.squares[x + i * this.state.order] === 'X' ? s_l : 0
        s_c = this.state.squares[x + i + i * this.state.order] === 'X' ? s_c : 0
      }
      if (s_r > 0) {
        tmparray.forEach((v, i) => {lose.push(x + i)})
        res = true
        this.setState({loselist: lose})
      }
      if (s_l > 0) {
        tmparray.forEach((v, i) => {lose.push(x + i * this.state.order)})
        res = true
        this.setState({loselist: lose})
      }
      if (s_c > 0) {
        tmparray.forEach((v, i) => {lose.push(x + i + i * this.state.order)})
        res = true
        this.setState({loselist: lose})
      }
    }

    return res
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
        color = {this.state.loselist.indexOf(i) > -1 ? 'red' : ( this.state.winlist.indexOf(i) > -1 ? 'green' : 'white')}
        Clk = {() => this.handleClick(i)}
        key = {i}
      />
    );
  }

  handleClick(i) {
    let squ_new = this.state.squares.slice()
    let his = this.state.history.slice()

    if (squ_new[i] || this.state.over) {
      return
    }

    squ_new[i] = this.state.xIsNext ? 'X' : 'O'
    his.push([i, squ_new[i]])
    this.setState({
      squares: squ_new,
      xIsNext: !this.state.xIsNext,
      history: his,
    },() => {
      let res = this.isWin(squ_new)

      if (res === 1 || res === 2) {
        this.setState({over: true})
        let winner = res === 1 ? 'X' : 'O'
        this.setState({msg: 'Winner is ' + winner}) 
      } else if (res === 3) {
        this.setState({over: true})
        this.setState({msg: 'Forbidden moves, winner is O'})
      } else if (res === 0) {
        this.setState({msg: 'Next player: ' + (this.state.xIsNext ? 'X' : 'O')})
      } else if (res === 9) {
        this.setState({msg: 'Dogfall!!'})
      }    
    })
  }

  genRow(sideLength, i) {
    let s = []
    for (let j = 0; j<sideLength; j++){
      s.push(this.renderSquare(j + sideLength*i))
    }
    return s
  }

  recover(index) {
    let now = Array(this.state.order * this.state.order).fill(null)
    let history = this.state.history.slice()
    for (let i = 0; i<= index; i++){
      now[history[i][0]] = history[i][1]
    }
    
    let next = history[index][1] === 'X' ? 'O' : 'X'
    let xIsNext = next === 'X' ? true : false
    let historyNow = history.slice(0, index + 1)

    this.setState({
      winlist: [],
      loselist: [],
      msg: 'Next player: ' + next,
      squares: now,
      xIsNext: xIsNext,
      over: false,
      history: historyNow,
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
      let len = this.state.history.length
      let reverse = this.state.reverse
      let res = len > 0 && this.state.winlist.length === 0 && this.state.loselist.length === 0 ? this.state.history.map((h, index) => {
        let idx = reverse ? len - index - 1 : index
        return (<p key={idx}>
                  <button onClick={this.recover.bind(this, idx)}>
                    第{idx + 1}步: {this.state.history[idx][1]} {parseInt(this.state.history[idx][0]/this.state.order, 10) + 1}行 {(this.state.history[idx][0] % this.state.order) + 1}列
                  </button>
                </p>)
      }) : null
      return res
    } 

    return (
      <div>
        <div className="game-board">
          <Reset Clk={() => this.reset()}/>
          <div className="status">{this.state.msg}</div>
          {Rows()}
        </div>
        <div className="game-info">
          <Reverse Clk={() => this.reverse()} reverse={this.state.reverse}/>
          {Bts()}
        </div>
      </div>
    );
  }
}


class Game extends React.Component {
  render() {
    return (
      <div className="game">
          <Board />
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
