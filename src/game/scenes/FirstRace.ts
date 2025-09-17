import Phaser from 'phaser';
import { Car } from '../Car';
import { RaceTemplate } from './RaceTemplate';
import { EventBus } from '../EventBus';

export default class FirstRace extends RaceTemplate {
	createObstacles(): Phaser.GameObjects.GameObject[] {
		const obstacles: Phaser.GameObjects.GameObject[] = [];

		const wall1 = this.add.rectangle(400, 150, 500, 30, 0x999999);
		const wall2 = this.add.rectangle(600, 400, 30, 400, 0x999999);

		this.physics.add.existing(wall1, true);
		this.physics.add.existing(wall2, true);

		obstacles.push(wall1, wall2);

		return obstacles;
	}
	constructor() {
		super({ key: 'FirstRace' });
	}

	preload() {
		this.load.image('track2', 'assets/pist_1.png');
	}

	override create() {
		const stage = this.add.image(400, 400, 'track1');
		stage.setScale(800/2048);

		this.car = new Car(this, 88, 620);

		//this.input.keyboard!.on('keydown-N', () => {
			//this.scene.start('Level2Scene');
		//});

        EventBus.emit('current-scene-ready', this);
	}

	override update(time: number, delta: number): void {
		this.car.update(delta);
	}
}