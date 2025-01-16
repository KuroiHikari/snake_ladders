import React from 'react';
import './Tile.css';

import player1Icon from '../Assets/boy_48px.png';
import player2Icon from '../Assets/girl_48px.png';
import snakeIcon from '../Assets/snake_48px.png';
import beeIcon from '../Assets/bee_48px.png';
import tornadoIcon from '../Assets/tornado_48px.png';
import clothingIcon from '../Assets/clothing_48px.png';
import finishGif from '../Assets/loading_48px.gif';

const Tile = ({ number, content, color, isPlayer1, isPlayer2 }) => {

    const getIcon = (type) => {
        switch (type) {
          case 'snake':
            return <img src={snakeIcon} alt="Snake" className="tile-icon" />;
          case 'bee':
            return <img src={beeIcon} alt="Bee" className="tile-icon" />;
          case 'tornado':
            return <img src={tornadoIcon} alt="Tornado" className="tile-icon" />;
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