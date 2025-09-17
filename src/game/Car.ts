import Phaser from 'phaser';
import { RaceTemplate } from './scenes/RaceTemplate';

export class Car extends Phaser.Physics.Arcade.Sprite {
	private static readonly DRAG = 200;
	//private static readonly BRAKE_DRAG = 800;
	private static readonly ANGULAR_DRAG = 400;
	private static readonly MAX_VELOCITY = 300;
	private static readonly ACCELERATION = 200;
	private static readonly TURN_SPEED = 150;
	private static readonly STEERING_EASING = 0.08;

	private accelerationVector: Phaser.Math.Vector2;
	private raycaster: Raycaster;
	private rays: any[];
	private sensorStatus: { [key: number]: boolean } = {};

	private initialX: number;
	private initialY: number;
	private initialAngle: number;
	public shouldStop = false;
	private speedMultiplier = 1.0;
	private activeTimeout: number | undefined;

	constructor(scene: RaceTemplate, x: number, y: number) {
		super(scene, x, y, 'car');

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.initialX = x;
		this.initialY = y;
		this.initialAngle = this.angle;

		this.setDrag(Car.DRAG);
		this.setAngularDrag(Car.ANGULAR_DRAG);
		this.setMaxVelocity(Car.MAX_VELOCITY);
		this.setCollideWorldBounds(true);
		this.setDepth(10);
		const carScale = 96 / 512;
		this.setScale(carScale);
		this.body?.setSize(512 * carScale, 512 * carScale);
		this.accelerationVector = new Phaser.Math.Vector2();
		this.body?.setOffset(0,0)

		this.raycaster = (
			this.scene as RaceTemplate
		).raycasterPlugin.createRaycaster();

		this.rays = [];
		const rayLength = 60; // The detection distance
		const angles: { [key: number]: number } = {
			7: -135,
			8: -90,
			9: -45, // Top-left, Top, Top-right
			4: -180,
			6: 0, // Left, Right
			1: 135,
			2: 90,
			3: 45, // Bottom-left, Bottom, Bottom-right
		};
		for (const key in angles) {
			const angleDeg = angles[key];
			const ray = this.raycaster.createRay({
				origin: { x: this.x, y: this.y },
				angleDeg: angleDeg, // Use degrees for simplicity
				range: rayLength,
			});
			this.rays.push(ray);
			this.sensorStatus[key] = false; // Initialize sensor status
		}

console.log('Car body size:', this.body?.width, this.body?.height);
console.log('Car display size:', this.displayWidth, this.displayHeight);
	}

	public update(delta: number): void {
		this.updateRays();
		if (this.body && this.body.velocity.length() > 10) {
			const targetAngle = this.rotation - Math.PI / 2;
			const currentAngle = this.body.velocity.angle();
			const newAngle = Phaser.Math.Angle.RotateTo(
				currentAngle,
				targetAngle,
				Car.STEERING_EASING * (delta / 16.66),
			);
			this.body.velocity.setAngle(newAngle);
		}
	}

	private updateRays(): void {
		let i = 0;
		for (const key in this.sensorStatus) {
			const ray = this.rays[i];
			ray.setOrigin(this.x, this.y);
			const rayAngle = this.rotation + Phaser.Math.DegToRad(ray.angleDeg);

			ray.setAngle(rayAngle);

			const intersection = ray.cast();
			this.sensorStatus[key] = !!intersection;
			i++;
		}
	}

	private moveForward(): void {
		this.scene.physics.velocityFromRotation(
			this.rotation - Math.PI / 2,
			Car.ACCELERATION * this.speedMultiplier,
			this.accelerationVector,
		);
		this.setAcceleration(
			this.accelerationVector.x,
			this.accelerationVector.y,
		);
	}

	private turnLeft(): void {
		this.setAngularVelocity(-Car.TURN_SPEED * this.speedMultiplier);
	}

	private turnRight(): void {
		this.setAngularVelocity(Car.TURN_SPEED * this.speedMultiplier);
	}
	public moveForwardAsync(duration: number): Promise<void> {
		return new Promise((resolve) => {
			if (this.shouldStop) return resolve();
			this.moveForward();
			this.activeTimeout = window.setTimeout(() => {
				this.setAcceleration(0, 0);
				resolve();
			}, duration);
		});
	}

	public turnLeftAsync(duration: number): Promise<void> {
		return new Promise((resolve) => {
			if (this.shouldStop) return resolve();
			this.turnLeft();
			this.activeTimeout = window.setTimeout(() => {
				this.setAngularVelocity(0);
				resolve();
			}, duration);
		});
	}

	public turnRightAsync(duration: number): Promise<void> {
		return new Promise((resolve) => {
			if (this.shouldStop) return resolve();
			this.turnRight();
			this.activeTimeout = window.setTimeout(() => {
				this.setAngularVelocity(0);
				resolve();
			}, duration);
		});
	}

	public wait(duration: number): Promise<void> {
		return new Promise((resolve) => {
			if (this.shouldStop) return resolve();
			this.activeTimeout = window.setTimeout(resolve, duration);
		});
	}

	public setSpeedMultiplier(multiplier: number): void {
		this.speedMultiplier = Math.max(0, multiplier); // Ensure multiplier is not negative
		this.setMaxVelocity(Car.MAX_VELOCITY * this.speedMultiplier);
	}

	public stopMovement(): void {
		this.shouldStop = true;
		if (this.activeTimeout) {
			clearTimeout(this.activeTimeout);
		}
		this.setAcceleration(0, 0);
		this.setVelocity(0, 0);
		this.setAngularVelocity(0);
	}

	public reset(): void {
		this.stopMovement(); // Stop any current actions
		this.shouldStop = false;
		this.setPosition(this.initialX, this.initialY);
		this.setAngle(this.initialAngle);
		this.setSpeedMultiplier(1.0); // Reset speed to default
	}

	public isSensorActive(sensorNumber: number): boolean {
		return this.sensorStatus[sensorNumber] || false;
	}
}