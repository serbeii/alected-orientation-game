import { AUTO, Game } from 'phaser';
import FirstRace from './scenes/FirstRace';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import PhaserRaycaster from 'phaser-raycaster';

const config: Phaser.Types.Core.GameConfig = {
	type: AUTO,
	width: 800,
	height: 800,
	parent: 'game-container',
	backgroundColor: '#028af8',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { x: 0, y: 0 }, // Top-down game, so no gravity
			debug: true
		},
	},
	scene: [Boot, Preloader, FirstRace],
	plugins: {
		scene: [
			{
				key: 'PhaserRaycaster',
				plugin: PhaserRaycaster,
				mapping: 'raycasterPlugin'
			}
		]
	}
};

const StartGame = (parent: string) => {
	return new Game({ ...config, parent });
};

export default StartGame;