// src/scenes/Level2Scene.ts

import Phaser from 'phaser';
import { Car } from '../Car';

export default class Level2Scene extends Phaser.Scene {
	private car!: Car;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

	constructor() {
		super({ key: 'SecondRace' });
	}

	create() {
		this.add.image(400, 300, 'track2'); // Use the second track image
		this.add.text(10, 10, 'Level 2 - Press "P" for previous level', {
			fontSize: '20px',
			color: '#ffffff',
		});

		// Start the car at a different position
		this.car = new Car(this, 200, 250);

		this.cursors = this.input.keyboard!.createCursorKeys();

		// --- Scene Switching Logic ---
		this.input.keyboard!.on('keydown-P', () => {
			console.log('Switching to Level 1');
			this.scene.start('Level1Scene');
		});
	}

	update() {
		this.car.update(this.cursors);
	}
}
