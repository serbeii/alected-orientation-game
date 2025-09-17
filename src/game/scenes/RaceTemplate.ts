import Phaser from 'phaser';
import { Car } from '../Car';

export abstract class RaceTemplate extends Phaser.Scene {
	public raycasterPlugin: PhaserRaycaster;
	protected car!: Car;
	protected collisionLayer: Phaser.Tilemaps.TilemapLayer | null;

	abstract createObstacles(): Phaser.GameObjects.GameObject[];

	create() {
		const obstacles = this.createObstacles();

		this.car = new Car(this, 0, 0);

		(this as any).raycasterPlugin.mapGameObjects(obstacles, true);
	}

	update(time: number, delta: number) {
		if (this.car) {
			this.car.update(delta);
		}
	}

	public runCarCode(code: string) {
		if (!this.car) {
			console.error('Car is not initialized yet.');
			return;
		}
		try {
			const runnableCode = new Function('car', code);
			runnableCode(this.car);
		} catch (e) {
			console.error('Error executing Blockly code:', e);
		}
	}
}