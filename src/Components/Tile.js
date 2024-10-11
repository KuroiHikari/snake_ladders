import React from 'react';
import './Tile.css';

import playerIcon from '../Assets/blue-pawn_48px.png';
import snakeIcon from '../Assets/snake_48px.png';
import beeIcon from '../Assets/bee_48px.png';
import tornadoIcon from '../Assets/tornado_48px.png';

const Tile = ({ number, content, isPlayer }) => {

    const getIcon = (type) => {
        switch (type) {
          case 'snake':
            return <img src={snakeIcon} alt="Snake" className="tile-icon" />;
          case 'bee':
            return <img src={beeIcon} alt="Bee" className="tile-icon" />;
          case 'tornado':
            return <img src={tornadoIcon} alt="Tornado" className="tile-icon" />;
          default:
            return null;
        }
    };

    return (
        <div className={`tile ${isPlayer ? 'player-tile' : ''}`}>
          <div className="tile-number">{number}</div>
          {isPlayer && <img src={playerIcon} alt="Player" className="player-icon" />}
          {content && getIcon(content)}
        </div>
    );
};

export default Tile;