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

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y, 'car');

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.setDrag(Car.DRAG);
		this.setAngularDrag(Car.ANGULAR_DRAG);
		this.setMaxVelocity(Car.MAX_VELOCITY);
		this.setCollideWorldBounds(true);
		this.accelerationVector = new Phaser.Math.Vector2();
	}

	public update(
		cursors: Phaser.Types.Input.Keyboard.CursorKeys,
		delta: number,
	): void {
		this.handleInput(cursors, delta);
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
}
