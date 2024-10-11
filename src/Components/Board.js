import React from 'react';
import Tile from './Tile';
import './Board.css';

const Board = ({ board, playerPosition }) => {
    return (
      <div className="board">
        {board.map((tile) => (
          <Tile
            key={tile.number}
            number={tile.number}
            content={tile.content}
            isPlayer={tile.number === playerPosition}
          />
        ))}
      </div>
    );
  };
  
  export default Board;