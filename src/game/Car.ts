import Phaser from 'phaser';

export class Car extends Phaser.Physics.Arcade.Sprite {
	private static readonly DRAG = 200;
	private static readonly BRAKE_DRAG = 800;
	private static readonly ANGULAR_DRAG = 400;
	private static readonly MAX_VELOCITY = 300;
	private static readonly ACCELERATION = 200;
	private static readonly TURN_SPEED = 150;
	private static readonly STEERING_EASING = 0.08;

	private accelerationVector: Phaser.Math.Vector2;
	private raycaster: any;
	private rays: any[];
	private sensorStatus: { [key: number]: boolean } = {};

	private movementQueue: {
		action: string;
		duration: number;
		callback?: () => void;
	}[] = [];
	private currentMovement: {
		action: string;
		duration: number;
		timer: number;
		callback?: () => void;
	} | null;

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y, 'car');

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.setDrag(Car.DRAG);
		this.setAngularDrag(Car.ANGULAR_DRAG);
		this.setMaxVelocity(Car.MAX_VELOCITY);
		this.setCollideWorldBounds(true);
		this.setDepth(10);
		this.accelerationVector = new Phaser.Math.Vector2();

		this.raycaster = (this.scene as any).raycasterPlugin.createRaycaster();
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
	}

	public update(delta: number): void {
		this.updateRays();
		this.processMovementQueue(delta);
	}

	private processMovementQueue(delta: number): void {
		if (this.currentMovement) {
			this.currentMovement.timer -= delta;
			if (this.currentMovement.timer <= 0) {
				if (this.currentMovement.callback) {
					this.currentMovement.callback();
				}
				this.currentMovement = null;
				this.setAcceleration(0);
				this.setAngularVelocity(0);
			}
		}

		if (!this.currentMovement && this.movementQueue.length > 0) {
			const nextMovement = this.movementQueue.shift();
			if (nextMovement) {
				this.currentMovement = {
					...nextMovement,
					timer: nextMovement.duration,
				};
				switch (this.currentMovement.action) {
					case 'forward':
						this.moveForward();
						break;
					case 'left':
						this.turnLeft();
						break;
					case 'right':
						this.turnRight();
						break;
				}
			}
		}
	}

	private handleInput(
		cursors: Phaser.Types.Input.Keyboard.CursorKeys,
		delta: number,
	): void {
		if (!this.body) {
			return;
		}

		// Acceleration and Reversing
		if (cursors.up.isDown) {
			this.scene.physics.velocityFromRotation(
				this.rotation - Math.PI / 2,
				Car.ACCELERATION,
				this.accelerationVector,
			);
			this.setAcceleration(
				this.accelerationVector.x,
				this.accelerationVector.y,
			);
			this.setDrag(Car.DRAG);
		} else if (cursors.down.isDown) {
			const currentSpeed = this.body.velocity.length();
			if (currentSpeed > 10) {
				// Brake
				this.setAcceleration(0);
				this.setDrag(Car.BRAKE_DRAG);
			} else {
				// Reverse
				this.scene.physics.velocityFromRotation(
					this.rotation - Math.PI / 2,
					-Car.ACCELERATION / 2,
					this.accelerationVector,
				);
				this.setAcceleration(
					this.accelerationVector.x,
					this.accelerationVector.y,
				);
				this.setDrag(Car.DRAG);
			}
		} else {
			this.setAcceleration(0);
			this.setDrag(Car.DRAG);
		}

		// Steering
		if (this.body.velocity.length() > 10) {
			const targetAngle = this.rotation - Math.PI / 2;
			const currentAngle = this.body.velocity.angle();
			const newAngle = Phaser.Math.Angle.RotateTo(
				currentAngle,
				targetAngle,
				Car.STEERING_EASING * (delta / 16.66),
			);

			this.body.velocity.setAngle(newAngle);
		}

		if (cursors.left.isDown) {
			this.setAngularVelocity(-Car.TURN_SPEED);
		} else if (cursors.right.isDown) {
			this.setAngularVelocity(Car.TURN_SPEED);
		}
	}
	private updateRays(): void {
		let i = 0;
		for (const key in this.sensorStatus) {
			const ray = this.rays[i];
			ray.setOrigin(this.x, this.y);
			ray.setAngle(this.rotation + Phaser.Math.DegToRad(ray.angleDeg));

			const intersection = ray.cast();
			this.sensorStatus[key] = !!intersection;
			i++;
		}
	}

	public moveForward(): void {
		this.scene.physics.velocityFromRotation(
			this.rotation - Math.PI / 2,
			Car.ACCELERATION,
			this.accelerationVector,
		);
		this.setAcceleration(
			this.accelerationVector.x,
			this.accelerationVector.y,
		);
	}

	public turnLeft(): void {
		this.setAngularVelocity(-Car.TURN_SPEED);
	}

	public turnRight(): void {
		this.setAngularVelocity(Car.TURN_SPEED);
	}

	public queueMoveForward(duration: number, callback?: () => void): void {
		this.movementQueue.push({ action: 'forward', duration, callback });
	}

	public queueTurnLeft(duration: number, callback?: () => void): void {
		this.movementQueue.push({ action: 'left', duration, callback });
	}

	public queueTurnRight(duration: number, callback?: () => void): void {
		this.movementQueue.push({ action: 'right', duration, callback });
	}

	public isSensorActive(sensorNumber: number): boolean {
		return this.sensorStatus[sensorNumber] || false;
	}
}
