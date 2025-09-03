import Phaser from 'phaser';
import { Car } from '../Car';

export default class FirstRace extends Phaser.Scene {
	private car!: Car;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

	constructor() {
		super({ key: 'FirstRace' });
	}

	preload() {
		this.load.image('track2', 'assets/pist_1.png');
	}

	create() {
		this.add.image(400, 300, 'track1');
		this.add.text(10, 10, 'Level 1 - Press "N" for next level', {
			fontSize: '20px',
			color: '#ffffff',
		});

		this.car = new Car(this, 400, 500);

		this.cursors = this.input.keyboard!.createCursorKeys();

		this.input.keyboard!.on('keydown-N', () => {
			this.scene.start('Level2Scene');
		});
	}

	update(time: number, delta: number): void {
		this.car.update(this.cursors, delta);
	}
}