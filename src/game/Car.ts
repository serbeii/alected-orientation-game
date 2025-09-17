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
	private rays: Map<number, any>;
	private sensorStatus: { [key: number]: boolean } = {};

	private initialX: number;
	private initialY: number;
	private initialAngle: number;
	public shouldStop = false;
	private speedMultiplier = 1.0;
	private activeTimeout: number | undefined;

	private debugGraphics: Phaser.GameObjects.Graphics;

	constructor(
		scene: RaceTemplate,
		x: number,
		y: number,
		collisionObjects:
			| Phaser.GameObjects.GameObject[]
			| Phaser.Tilemaps.TilemapLayer,
		debugMode: boolean,
	) {
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
		const carScale = 48 / 512;
		this.setScale(carScale);
		this.body!.setSize(512 * carScale, 512 * carScale, true);
		this.accelerationVector = new Phaser.Math.Vector2();

		this.debugGraphics = scene.add.graphics();
		this.debugGraphics.setDepth(11);
		this.debugGraphics.setVisible(debugMode);

		this.raycaster = (
			this.scene as RaceTemplate
		).raycasterPlugin.createRaycaster();

		if (collisionObjects instanceof Phaser.Tilemaps.TilemapLayer) {
			// Collect all collidable tile indices
			const collidableIndices: number[] = [];
			collisionObjects.forEachTile((tile) => {
				if (
					tile &&
					tile.collides &&
					!collidableIndices.includes(tile.index)
				) {
					collidableIndices.push(tile.index);
				}
			});

			// Map the layer with only collidable tiles
			this.raycaster.mapGameObjects(collisionObjects, false, {
				collisionTiles: collidableIndices,
			});
		} else {
			// Fallback: plain GameObjects (sprites, images, etc.)
			this.raycaster.mapGameObjects(collisionObjects, false);
		}

		this.rays = new Map();

		const rayLength = 150; // The detection distance
		const rayConfig: { [key: number]: { angle: number; length?: number } } =
			{
				// Primary directions (8-way)
				1: { angle: 135 }, // Bottom-left
				2: { angle: 90 }, // Bottom
				3: { angle: 45 }, // Bottom-right
				4: { angle: 180 }, // Left
				5: { angle: 0, length: rayLength * 1.5 }, // Forward (longer range)
				6: { angle: 0 }, // Right
				7: { angle: -135 }, // Top-left
				8: { angle: -90 }, // Top
				9: { angle: -45 }, // Top-right
			};
		for (const [key, config] of Object.entries(rayConfig)) {
			const numKey = parseInt(key);
			const ray = this.raycaster.createRay({
				origin: { x: this.x, y: this.y },
				angleDeg: 0, // Will be updated dynamically
				autoSlice: true,
				range: config.length || rayLength,
			});

			// Store both ray and its base angle
			this.rays.set(numKey, {
				ray: ray,
				baseAngle: config.angle,
			});
			this.sensorStatus[numKey] = false;
		}
		this.debugShowBody = true;
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
		this.debugGraphics.clear();

		const carCenterX = this.x;
		const carCenterY = this.y;
		for (const [key, rayData] of this.rays) {
			const { ray, baseAngle } = rayData;

			// Update ray origin to car's current position
			ray.setOrigin(carCenterX, carCenterY);

			const worldAngle =
				this.rotation + Phaser.Math.DegToRad(baseAngle) - Math.PI / 2;
			ray.setAngle(worldAngle);

			// Cast the ray and check for intersections
			const intersection = ray.cast();
			this.sensorStatus[key] = !!intersection;

			// Debug visualization
			const rayEndX = intersection
				? intersection.x
				: carCenterX + Math.cos(worldAngle) * ray.rayRange;
			const rayEndY = intersection
				? intersection.y
				: carCenterY + Math.sin(worldAngle) * ray.rayRange;

			// Color based on collision detection
			const color = intersection ? 0xff0000 : 0x00ff00; // Red if hit, green if clear
			const alpha = intersection ? 1.0 : 0.3; // Full opacity if hit, semi-transparent if clear

			this.debugGraphics.lineStyle(2, color, alpha);
			this.debugGraphics.strokeLineShape(
				new Phaser.Geom.Line(carCenterX, carCenterY, rayEndX, rayEndY),
			);

			if (intersection) {
				this.debugGraphics.fillStyle(0xffff00, 1); // Yellow dot
				this.debugGraphics.fillCircle(
					intersection.x,
					intersection.y,
					3,
				);
				console.log(
					`Ray ${key} HIT!`,
					`Car Pos: (${Math.round(this.x)}, ${Math.round(this.y)})`,
					`Intersection Pos: (${Math.round(intersection.x)}, ${Math.round(intersection.y)})`,
				);

				// Also draw a very obvious circle at the intersection point
				this.debugGraphics.fillStyle(0x00ffff, 1); // Bright Cyan
				this.debugGraphics.fillCircle(
					intersection.x,
					intersection.y,
					15,
				);
			}
		}

		// Draw car center point for reference
		this.debugGraphics.fillStyle(0x00ffff, 1); // Cyan
		this.debugGraphics.fillCircle(carCenterX, carCenterY, 4);
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
