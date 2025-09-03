import { AUTO, Game } from 'phaser';
import FirstRace from './scenes/FirstRace';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#028af8',
physics: {
      default: 'arcade',
      arcade: {
        gravity: { x:0, y: 0 }, // Top-down game, so no gravity
      },
    },
    scene: [
		Boot,
		Preloader,
		FirstRace
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;