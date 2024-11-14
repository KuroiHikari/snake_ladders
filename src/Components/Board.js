import React from 'react';
import Tile from './Tile';
import './Board.css';

const Board = ({ board, player1Position, player2Position }) => {
    return (
      <div className="board">
        {board.map((tile) => (
          <Tile
            key={tile.number}
            number={tile.number}
            content={tile.content}
            color={tile.color}
            special={tile.special}
            isPlayer1={tile.number === player1Position}
            isPlayer2={tile.number === player2Position}
          />
        ))}
      </div>
    );
  };
  
  export default Board;