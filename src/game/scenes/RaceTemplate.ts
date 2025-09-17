import Phaser from 'phaser';
import { Car } from '../Car';

export abstract class RaceTemplate extends Phaser.Scene {
	public raycasterPlugin: PhaserRaycaster;
	protected car!: Car;
	protected collisionLayer: Phaser.Tilemaps.TilemapLayer | null;
	public debugMode: boolean = false;

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
