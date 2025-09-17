<template>
	<div>
		<div ref="blocklyDiv" style="height: 480px; width: 600px"></div>
		<div class="controls">
			<button @click="runCode" class="run-btn">▶ Run Code</button>
			<button @click="stopCode" class="stop-btn">⏹ Stop</button>
			<button @click="resetScene" class="reset-btn">
				🔄 Reset Scene
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';

const blocklyDiv = ref<HTMLElement | null>(null);
const emit = defineEmits(['run-code', 'stop-code', 'reset-scene']);
let workspace: Blockly.WorkspaceSvg;

// Define custom blocks for car control
Blockly.defineBlocksWithJsonArray([
	// Movement blocks
	{
		type: 'move_forward',
		message0: 'move forward for %1 seconds',
		args0: [
			{
				type: 'field_number',
				name: 'DURATION',
				value: 1,
				min: 0.1,
				max: 10,
				precision: 0.1,
			},
		],
		previousStatement: null,
		nextStatement: null,
		colour: 160,
		tooltip: 'Moves the car forward for specified duration.',
		helpUrl: '',
	},
	{
		type: 'turn_left',
		message0: 'turn left for %1 seconds',
		args0: [
			{
				type: 'field_number',
				name: 'DURATION',
				value: 0.5,
				min: 0.1,
				max: 5,
				precision: 0.1,
			},
		],
		previousStatement: null,
		nextStatement: null,
		colour: 160,
		tooltip: 'Turns the car left for specified duration.',
		helpUrl: '',
	},
	{
		type: 'turn_right',
		message0: 'turn right for %1 seconds',
		args0: [
			{
				type: 'field_number',
				name: 'DURATION',
				value: 0.5,
				min: 0.1,
				max: 5,
				precision: 0.1,
			},
		],
		previousStatement: null,
		nextStatement: null,
		colour: 160,
		tooltip: 'Turns the car right for specified duration.',
		helpUrl: '',
	},
	{
		type: 'set_speed',
		message0: 'set speed to %1 %',
		args0: [
			{
				type: 'field_number',
				name: 'SPEED',
				value: 100,
				min: 0,
				max: 200,
				precision: 10,
			},
		],
		previousStatement: null,
		nextStatement: null,
		colour: 160,
		tooltip: 'Sets the car speed as a percentage of normal.',
		helpUrl: '',
	},
	{
		type: 'stop',
		message0: 'stop',
		previousStatement: null,
		nextStatement: null,
		colour: 160,
		tooltip: 'Stops the car immediately.',
		helpUrl: '',
	},
	// Control flow blocks
	{
		type: 'wait',
		message0: 'wait %1 seconds',
		args0: [
			{
				type: 'field_number',
				name: 'DURATION',
				value: 1,
				min: 0.1,
				max: 10,
				precision: 0.1,
			},
		],
		previousStatement: null,
		nextStatement: null,
		colour: 120,
		tooltip: 'Pauses execution for specified duration.',
		helpUrl: '',
	},
	{
		type: 'repeat_times',
		message0: 'repeat %1 times',
		args0: [
			{
				type: 'field_number',
				name: 'TIMES',
				value: 3,
				min: 1,
				max: 100,
			},
		],
		message1: 'do %1',
		args1: [
			{
				type: 'input_statement',
				name: 'DO',
			},
		],
		previousStatement: null,
		nextStatement: null,
		colour: 120,
		tooltip: 'Repeats the enclosed blocks a specified number of times.',
		helpUrl: '',
	},
	{
		type: 'while_true',
		message0: 'repeat forever',
		message1: 'do %1',
		args1: [
			{
				type: 'input_statement',
				name: 'DO',
			},
		],
		previousStatement: null,
		nextStatement: null,
		colour: 120,
		tooltip:
			"Repeats the enclosed blocks forever (or until a 'break' block is used).",
		helpUrl: '',
	},
	{
		type: 'repeat_until_sensor_active',
		message0: 'repeat until sensor %1 is active',
		args0: [
			{
				type: 'field_dropdown',
				name: 'SENSOR',
				options: [
					['top left (7)', '7'],
					['top (8)', '8'],
					['top right (9)', '9'],
					['left (4)', '4'],
					['right (6)', '6'],
					['bottom left (1)', '1'],
					['bottom (2)', '2'],
					['bottom right (3)', '3'],
				],
			},
		],
		message1: 'do %1',
		args1: [
			{
				type: 'input_statement',
				name: 'DO',
			},
		],
		previousStatement: null,
		nextStatement: null,
		colour: 120,
		tooltip:
			'Repeats the enclosed blocks until the specified sensor detects an obstacle.',
		helpUrl: '',
	},
	{
		type: 'break_loop',
		message0: 'break out of loop',
		previousStatement: null,
		colour: 120,
		tooltip: 'Exits the current loop.',
		helpUrl: '',
	},
	{
		type: 'while_sensor_active',
		message0: 'while sensor %1 is active',
		args0: [
			{
				type: 'field_dropdown',
				name: 'SENSOR',
				options: [
					['top left (7)', '7'],
					['top (8)', '8'],
					['top right (9)', '9'],
					['left (4)', '4'],
					['right (6)', '6'],
					['bottom left (1)', '1'],
					['bottom (2)', '2'],
					['bottom right (3)', '3'],
				],
			},
		],
		message1: 'do %1',
		args1: [
			{
				type: 'input_statement',
				name: 'DO',
			},
		],
		previousStatement: null,
		nextStatement: null,
		colour: 120,
		tooltip: 'Repeats while sensor detects an obstacle.',
		helpUrl: '',
	},
	{
		type: 'if_sensor_active',
		message0: 'if sensor %1 is active',
		args0: [
			{
				type: 'field_dropdown',
				name: 'SENSOR',
				options: [
					['top left (7)', '7'],
					['top (8)', '8'],
					['top right (9)', '9'],
					['left (4)', '4'],
					['right (6)', '6'],
					['bottom left (1)', '1'],
					['bottom (2)', '2'],
					['bottom right (3)', '3'],
				],
			},
		],
		message1: 'do %1',
		args1: [
			{
				type: 'input_statement',
				name: 'DO',
			},
		],
		message2: 'else %1',
		args2: [
			{
				type: 'input_statement',
				name: 'ELSE',
			},
		],
		previousStatement: null,
		nextStatement: null,
		colour: 210,
		tooltip: 'Checks if a sensor is detecting an obstacle.',
		helpUrl: '',
	},
	// Start block
	{
		type: 'when_program_starts',
		message0: 'when program starts',
		message1: 'do %1',
		args1: [
			{
				type: 'input_statement',
				name: 'DO',
			},
		],
		colour: 15,
		tooltip: 'Entry point for the program.',
		helpUrl: '',
	},
]);

// Define the code generation for the custom blocks
javascriptGenerator.forBlock['move_forward'] = function (block) {
	const duration = block.getFieldValue('DURATION');
	return `await car.moveForwardAsync(${duration * 1000});\n`;
};

javascriptGenerator.forBlock['turn_left'] = function (block) {
	const duration = block.getFieldValue('DURATION');
	return `await car.turnLeftAsync(${duration * 1000});\n`;
};

javascriptGenerator.forBlock['turn_right'] = function (block) {
	const duration = block.getFieldValue('DURATION');
	return `await car.turnRightAsync(${duration * 1000});\n`;
};

javascriptGenerator.forBlock['set_speed'] = function (block) {
	const speed = block.getFieldValue('SPEED');
	return `car.setSpeedMultiplier(${speed / 100});\n`;
};

javascriptGenerator.forBlock['stop'] = function (block) {
	return `car.stopMovement();\n`;
};

// Code generation for control flow blocks
javascriptGenerator.forBlock['wait'] = function (block) {
	const duration = block.getFieldValue('DURATION');
	return `await car.wait(${duration * 1000});\n`;
};

javascriptGenerator.forBlock['repeat_times'] = function (block, generator) {
	const times = block.getFieldValue('TIMES');
	const branch = generator.statementToCode(block, 'DO');
	return `for (let i = 0; i < ${times} && !car.shouldStop; i++) {\n${branch}}\n`;
};

javascriptGenerator.forBlock['while_true'] = function (block, generator) {
	const branch = generator.statementToCode(block, 'DO');
	return `while (true && !car.shouldStop) {\n${branch}await car.wait(50);\n}\n`;
};

javascriptGenerator.forBlock['repeat_until_sensor_active'] = function (
	block,
	generator,
) {
	const sensor = block.getFieldValue('SENSOR');
	const branch = generator.statementToCode(block, 'DO');
	return `do {\n${branch}await car.wait(50);\n} while (!car.isSensorActive(${sensor}) && !car.shouldStop);\n`;
};

javascriptGenerator.forBlock['break_loop'] = function (block) {
	return 'break;\n';
};

javascriptGenerator.forBlock['while_sensor_active'] = function (
	block,
	generator,
) {
	const sensor = block.getFieldValue('SENSOR');
	const branch = generator.statementToCode(block, 'DO');
	return `while (car.isSensorActive(${sensor}) && !car.shouldStop) {\n${branch}await car.wait(50);\n}\n`;
};

javascriptGenerator.forBlock['if_sensor_active'] = function (block, generator) {
	const sensor = block.getFieldValue('SENSOR');
	const branch = generator.statementToCode(block, 'DO');
	const elseBranch = generator.statementToCode(block, 'ELSE');
	let code = `if (car.isSensorActive(${sensor})) {\n${branch}}`;
	if (elseBranch) {
		code += ` else {\n${elseBranch}}`;
	}
	return code + '\n';
};

javascriptGenerator.forBlock['when_program_starts'] = function (
	block,
	generator,
) {
	const branch = generator.statementToCode(block, 'DO');
	return branch;
};

onMounted(() => {
	if (blocklyDiv.value) {
		const toolbox = {
			kind: 'categoryToolbox',
			contents: [
				{
					kind: 'category',
					name: 'Movement',
					colour: 160,
					contents: [
						{ kind: 'block', type: 'move_forward' },
						{ kind: 'block', type: 'turn_left' },
						{ kind: 'block', type: 'turn_right' },
						{ kind: 'block', type: 'set_speed' },
						{ kind: 'block', type: 'stop' },
					],
				},
				{
					kind: 'category',
					name: 'Sensors',
					colour: 210,
					contents: [
						{ kind: 'block', type: 'if_sensor_active' },
						{ kind: 'block', type: 'while_sensor_active' },
					],
				},
				{
					kind: 'category',
					name: 'Control',
					colour: 120,
					contents: [
						{ kind: 'block', type: 'when_program_starts' },
						{ kind: 'block', type: 'wait' },
						{ kind: 'block', type: 'repeat_times' },
						{ kind: 'block', type: 'while_sensor_active' },
						{ kind: 'block', type: 'while_true' },
						{ kind: 'block', type: 'repeat_until_sensor_active' },
						{ kind: 'block', type: 'break_loop' },
					],
				},
			],
		};

		workspace = Blockly.inject(blocklyDiv.value, {
			toolbox: toolbox,
			scrollbars: true,
			horizontalLayout: false,
			toolboxPosition: 'start',
			theme: Blockly.Themes.Zelos,
			grid: {
				spacing: 20,
				length: 3,
				colour: '#ccc',
				snap: true,
			},
			zoom: {
				controls: true,
				wheel: true,
				startScale: 1.0,
				maxScale: 3,
				minScale: 0.3,
				scaleSpeed: 1.2,
			},
		});

		// Add a default start block
		const startBlock = workspace.newBlock('when_program_starts');
		startBlock.initSvg();
		startBlock.render();
		startBlock.moveBy(50, 50);
	}
});

function runCode() {
	const code = javascriptGenerator.workspaceToCode(workspace);
	const wrappedCode = `(async function() {\n${code}\n})();`;
	emit('run-code', wrappedCode);
}

function stopCode() {
	emit('stop-code');
}

function resetScene() {
	emit('reset-scene');
}
</script>

<style scoped>
.controls {
	display: flex;
	gap: 10px;
	margin-top: 10px;
}

button {
	padding: 10px 20px;
	font-size: 16px;
	border: none;
	border-radius: 5px;
	cursor: pointer;
	transition: background-color 0.3s;
}

.run-btn {
	background-color: #4caf50;
	color: white;
}

.run-btn:hover {
	background-color: #45a049;
}

.stop-btn {
	background-color: #f44336;
	color: white;
}

.stop-btn:hover {
	background-color: #da190b;
}

.reset-btn {
	background-color: #2196f3;
	color: white;
}

.reset-btn:hover {
	background-color: #0b7dda;
}
</style>