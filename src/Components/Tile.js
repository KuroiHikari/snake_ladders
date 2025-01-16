import React from 'react';
import './Tile.css';

import player1Icon from '../Assets/boy_48px.png';
import player2Icon from '../Assets/girl_48px.png';
import snakeIcon from '../Assets/snake_48px.png';
import beeIcon from '../Assets/bee_48px.png';
import balloonIcon from '../Assets/ballon_48px.png';
import clothingIcon from '../Assets/clothing_48px.png';
import ballIcon from '../Assets/ball_48px.png';
import coldIcon from '../Assets/cold_48px.png';
import grasshopperIcon from '../Assets/grasshopper_48px.png';
import catIcon from '../Assets/cat_48px.png';
import trainIcon from '../Assets/train_48px.png';
import finishGif from '../Assets/loading_48px.gif';

const Tile = ({ number, content, color, isPlayer1, isPlayer2 }) => {

    const getIcon = (type) => {
        switch (type) {
          case 'snake':
            return <img src={snakeIcon} alt="Snake" className="tile-icon" />;
          case 'bee':
            return <img src={beeIcon} alt="Bee" className="tile-icon" />;
          case 'balloon':
            return <img src={balloonIcon} alt="Balloon" className="tile-icon" />;
          case 'cold':
            return <img src={coldIcon} alt="Cold" className="tile-icon" />;
          case 'grasshopper':
            return <img src={grasshopperIcon} alt="Grasshopper" className="tile-icon" />;
          case 'cat':
            return <img src={catIcon} alt="Cat" className="tile-icon" />;
          case 'train':
            return <img src={trainIcon} alt="Train" className="tile-icon" />;
          case 'ball':
            return <img src={ballIcon} alt="Ball" className="tile-icon" />;
          case 'clothing':
            return <img src={clothingIcon} alt="Clothing" className="tile-icon" />;
          case 'finish':
            return <img src={finishGif} alt='Finish' className='finish-gif' />;
          default:
            return null;
        }
    };

    return (
        <div 
          className={`tile ${isPlayer1 || isPlayer2 ? 'player-tile' : ''}`}
          style={{ 
            backgroundImage: color ? color : 'linear-gradient(to right, #ff7e5f, #feb47b)',
            backgroundColor: color && !color.startsWith('linear') ? color : ''
          }}
        >
          <div className="tile-number">{number}</div>
          {isPlayer1 && <img src={player1Icon} alt="Player1" className="player-icon" />}
          {isPlayer2 && <img src={player2Icon} alt="Player2" className="player-icon" />}
          {content && getIcon(content)}
        </div>
    );
};

export default Tile;