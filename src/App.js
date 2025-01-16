import React, { useState, useEffect } from 'react';
import Board from './Components/Board';
import './App.css';
import Modal, { contextType } from 'react-modal';
import '@fortawesome/fontawesome-free/css/all.min.css';

import beeGif from '../src/Assets/bee.gif';
import balloonGif from '../src/Assets/balloonGif.gif';
import snakeGif from '../src/Assets/snakeGif.gif';
import celebrateGif from '../src/Assets/celebrate.gif';
import ballGif from '../src/Assets/ball.gif';
import coldGif from '../src/Assets/cold.gif';
import grasshopperGif from '../src/Assets/grasshopper.gif';
import catGif from '../src/Assets/cat.gif';
import trainGif from '../src/Assets/train.gif';
import clothingGif from '../src/Assets/clothing.gif';

const gifs = {
  bee: beeGif,
  snake: snakeGif,
  balloon: balloonGif,
  clothing: clothingGif,
  ball: ballGif,
  cold: coldGif,
  grasshopper: grasshopperGif,
  cat: catGif,
  train: trainGif
};

const modalBackgroundColors = {
  bee: '#FFCE00',
  snake: '#D6FFC2',
  balloon: '#DECCFF',
  clothing: '#56C9D4',
  train: '#C1B9AB',
  cat: '#F5DDC2',
  grasshopper: '#F3ABB9',
  cold: '#EEEEF5'
};

// Setting app element for accessibility with React Modal
Modal.setAppElement('#root');

// Function to generate the game board
const generateBoard = () => {

  const board = [];

  for (let i = 1; i <= 100; i++) {
    // Calculate row and column based on the tile number
    const row = Math.floor((i - 1) / 10);
    
    // Alternate starting color based on row number
    let tileColor;
    if (row % 2 === 0) { // Even row
        tileColor = i % 2 === 0 ? '#8AC926' : '#F7B751';
    } else { // Odd row
        tileColor = i % 2 === 0 ? '#F7B751' : '#8AC926';
    }

    board.push({ number: i, content: null, special: null, color: tileColor });
  }

  const uniquePos = new Set();

  const getRandomPositions = (count) => {
    // const positions = new Set();
    // while (positions.size < count) {
    //   const pos = Math.floor(Math.random() * 100) + 1;
      
    //   // Avoid first and last tile
    //   if (pos !== 1 && pos !== 100 && !uniquePos.has(pos)) {
    //     positions.add(pos);
    //     uniquePos.add(pos);
    //   }
    // }
    // return Array.from(positions);

    const positions = new Set();
    while (positions.size < count) {
      let pos = Math.floor(Math.random() * 100) + 1;

      // Avoid first and last tile, and already used positions
      while (pos === 1 || pos === 100 || uniquePos.has(pos)) {
        pos = Math.floor(Math.random() * 100) + 1;  // Keep generating a new position
      }

      positions.add(pos);
      uniquePos.add(pos);  // Mark this position as used
    }

    return Array.from(positions);
  };

  const balloonPositions = getRandomPositions(5);
  const snakePositions = getRandomPositions(5);
  const beePositions = getRandomPositions(5);
  const clothingPositions = getRandomPositions(5);
  const ballPositions = getRandomPositions(5);
  const coldPositions = getRandomPositions(5);
  const grasshopperPositions = getRandomPositions(5);
  const catPositions = getRandomPositions(5);
  const trainPositions = getRandomPositions(5);

  balloonPositions.forEach((pos) => {
    board[pos - 1].content = 'balloon';
    board[pos - 1].special = 'fúkanie balóna';
    board[pos - 1].image = 'balloon';
  });

  snakePositions.forEach((pos) => {
    board[pos - 1].content = 'snake';
    board[pos - 1].special = 'zvuk hada';
    board[pos - 1].image = 'snake';
  });

  beePositions.forEach((pos) => {
    board[pos - 1].content = 'bee';
    board[pos - 1].special = 'zvuk včely';
    board[pos - 1].image = 'bee';
  });

  clothingPositions.forEach((pos) => {
    board[pos - 1].content = 'clothing';
    board[pos - 1].special = 'fúkanie na vysušenie oblečenia';
    board[pos - 1].image = 'clothing';
  })

  ballPositions.forEach((pos) => {
    board[pos - 1].content = 'ball';
    board[pos - 1].special = 'fúkanie na odkopnutie lopty';
    board[pos - 1].image = 'ball';
  })

  coldPositions.forEach((pos) => {
    board[pos - 1].content = 'cold';
    board[pos - 1].special = 'zvuk na zohriatie tučniaka';
    board[pos - 1].image = 'cold';
  })

  grasshopperPositions.forEach((pos) => {
    board[pos - 1].content = 'grasshopper';
    board[pos - 1].special = 'zvuk kobylky';
    board[pos - 1].image = 'grasshopper';
  })

  catPositions.forEach((pos) => {
    board[pos - 1].content = 'cat';
    board[pos - 1].special = 'zvuk mačky';
    board[pos - 1].image = 'cat';
  })

  trainPositions.forEach((pos) => {
    board[pos - 1].content = 'train';
    board[pos - 1].special = 'zvuk lokomotívy';
    board[pos - 1].image = 'train';
  })

  board[board.length - 1].content = 'finish';
  board[board.length - 1].special = 'Cieľ';
  board[board.length - 1].image = 'finish';
  
  console.log('Clothing Positions:', clothingPositions);

  return board;
};


const App = () => {
  const [board, setBoard] = useState(generateBoard());
  const [player1Position, setPlayer1Position] = useState(1);
  const [player2Position, setPlayer2Position] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [turn, setTurn] = useState('Hráč 1 je na rade!');
  const [message, setMessage] = useState('Hráč 1, klikni na tlačidlo "Hodiť kockou" pre štart hry!');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState({ text: '', check: '', image: ''});
  const [finishModalIsOpen, setFinishModalIsOpen] = useState(false);

  const rollDice = () => {
    if(currentPlayer === 1) {
      const dice = Math.floor(Math.random() * 6) + 1;
      setMessage(`Hráč 1 hodil ${dice}!`);
      movePlayer(dice);
    } else {
      const dice = Math.floor(Math.random() * 6) + 1;
      setMessage(`Hráč 2 hodil ${dice}!`);
      movePlayer(dice);
    }

    // if (!isPlayerTurn) return;
    // const dice = Math.floor(Math.random() * 6) + 1;
    // setMessage(`You rolled a ${dice}!`);
    // movePlayer(dice);
  };

  const movePlayer = (dice) => {
    
    let newPos;
    if (currentPlayer === 1) {
      newPos = player1Position + dice;

      if (newPos > 100) 
        newPos = 100;

      setPlayer1Position(Math.max(1, Math.min(newPos, 100)));
      handleTile(newPos);
    } else {
      newPos = player2Position + dice;

      if (newPos > 100) 
        newPos = 100;

      setPlayer2Position(Math.max(1, Math.min(newPos, 100)));
      handleTile(newPos);
    }
  };

  const handleTile = (pos) => {
    
    const tile = board[pos - 1];

    console.log("Tile special property:", tile.special, tile.number);

    if (pos === 100) {
      setFinishModalIsOpen(true);
    } else {
      if(tile && tile.special) {
        setModalMessage({
          text: `Stúpil si na špeciálne políčko! Aby si mohol pokračovať:`,
          sound: tile.special,
          image: tile.image
        });
        setModalIsOpen(true);
      } else {
        nextTurn();
      }
    }
  };

  const nextTurn = () => {
    if(currentPlayer === 1) {
      setCurrentPlayer(2);
      setTurn('Hráč 2 je na rade!');
    } else {
      setCurrentPlayer(1);
      setTurn('Hráč 1 je na rade!');
    }
  }

  const handleCorrect = () => {

    setModalIsOpen(false);
    
    if (currentPlayer === 1) {
      const newPos = Math.min(player1Position + 3, 100);
      setPlayer1Position(newPos);
      // setMessage(`Player 1 made a correct sound! Moving 3 tiles forward`);
    } else {
      const newPos = Math.min(player2Position + 3, 100);
      setPlayer2Position(newPos);
      // setMessage(`Player 2 made a correct sound! Moving 3 tiles forward`);
    }
    
    nextTurn();
    
  };

  return (
      <div className="App">

        <div className="container">
          <div className="controls">
            <p className='info-text'>{message}</p>
            <button 
              className='custom-button'
              onClick={rollDice} 
              disabled={currentPlayer !== 1 && currentPlayer !== 2}
            >
              <i className="fas fa-dice" style={{ marginRight: '8px' }} />
              Hodiť kockou
            </button>
          </div>

          <div className="main-element">
            <h1 className='main-header'>Preteky s robotom Tomášom</h1>
            <p className='turn-text'>{turn}</p>
            <Board 
              board={board} 
              player1Position={player1Position} 
              player2Position={player2Position} 
            />
          </div>
        </div>
  
        
  
        {/* Modal for special tiles */}
        <Modal
          isOpen={modalIsOpen}
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: modalBackgroundColors[modalMessage.image] || 'white',
            },
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
          }}
          contentLabel="Special Tile Modal"
        >
          <h2>{modalMessage.text}</h2>
          <p>Napodobni: <strong>{modalMessage.sound}</strong></p>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <img
              src={gifs[modalMessage.image]}
              alt={modalMessage.image}
              style={{ width: '100px', height: '100px' }}
            />
          </div>

          <button
            onClick={handleCorrect} 
            className='custom-button custom-button-correct'
          >
            Úloha dokončená
          </button>

          {/* <button 
            onClick={handleIncorrect} 
            className='custom-button custom-button-incorrect'>
              Incorrect
          </button> */}

        </Modal>

        {/* Congratulatory Modal */}
        <Modal
          isOpen={finishModalIsOpen}
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
            },
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
          }}
          contentLabel="Congratulations Modal"
        >
          <h2>Gratulujem!</h2>
          <p>Hráč {currentPlayer} vyhral preteky! 🎉</p>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <img src={celebrateGif} alt='Celebration GIF'  />
          </div>

          <button onClick={() => setFinishModalIsOpen(false)}>Zatvoriť</button>         
        </Modal>
      </div>
    );
};

export default App;
