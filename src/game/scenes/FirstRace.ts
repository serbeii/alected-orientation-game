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
		this.load.setPath('assets');
		this.load.image('tiles', 'map_1.png');
		this.load.tilemapTiledJSON('map1', 'map1.json');
	}

	override create() {
		const map = this.make.tilemap({ key: 'map1' });
		const tileset: Phaser.Tilemaps.Tileset | null = map.addTilesetImage(
			'map_1',
			'tiles',
		);

		// Create the layers
		if (!tileset) {
			return;
		}
		const groundLayer = map.createLayer('track', tileset, 0, 0);
		this.collisionLayer = map.createLayer('wall', tileset, 0, 0);

		if (!this.collisionLayer) {
			console.error('Collision layer "wall" not found.');
			return;
		}

		// Set up collisions
		//this.collisionLayer.setCollisionByProperty({ collides: true });
		this.collisionLayer.setCollisionByExclusion([-1]);

		const scaleFactor = 800 / 2048; // canvas size / map size
		this.cameras.main.setBounds(0, 0, 2048, 2048); // map bounds
		this.cameras.main.setZoom(scaleFactor);

		// Create the car
		this.car = new Car(this, 225, 1560);

		// Add collision between the car and the collision layer
		this.physics.add.collider(this.car, this.collisionLayer);
		/* DEBUG
		const debugGraphics = this.add.graphics().setAlpha(0.5);
		this.collisionLayer.renderDebug(debugGraphics, {
			tileColor: null, // color of non-colliding tiles
			collidingTileColor: new Phaser.Display.Color(255, 0, 0, 255), // color of colliding tiles
			faceColor: new Phaser.Display.Color(0, 255, 0, 255),
		});
		*/

		EventBus.emit('current-scene-ready', this);
	}

	override update(time: number, delta: number): void {
		this.car.update(delta);
	}
}
