<template>
	<div>
		<div ref="blocklyDiv" style="height: 480px; width: 600px"></div>
		<button @click="runCode">Run Code</button>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';

const blocklyDiv = ref<HTMLElement | null>(null);
const emit = defineEmits(['run-code']);
let workspace: Blockly.WorkspaceSvg;

// Define custom blocks for car control
Blockly.defineBlocksWithJsonArray([
	{
		type: 'queue_move_forward',
		message0: 'move forward',
		previousStatement: null,
		nextStatement: null,
		colour: 230,
		tooltip: 'Moves the car forward.',
		helpUrl: '',
	},
	{
		type: 'queue_turn_left',
		message0: 'turn left',
		previousStatement: null,
		nextStatement: null,
		colour: 230,
		tooltip: 'Turns the car left.',
		helpUrl: '',
	},
	{
		type: 'queue_turn_right',
		message0: 'turn right',
		previousStatement: null,
		nextStatement: null,
		colour: 230,
		tooltip: 'Turns the car right.',
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
		previousStatement: null,
		nextStatement: null,
		colour: 210,
		tooltip: 'Checks if a sensor is detecting an obstacle.',
		helpUrl: '',
	},
]);

// Define the code generation for the custom blocks
javascriptGenerator.forBlock['queue_move_forward'] = function (block) {
	return 'car.moveForward();\n';
};

javascriptGenerator.forBlock['queue_turn_left'] = function (block) {
	return 'car.turnLeft();\n';
};

javascriptGenerator.forBlock['queue_turn_right'] = function (block) {
	return 'car.turnRight();\n';
};

javascriptGenerator.forBlock['if_sensor_active'] = function (block, generator) {
	const sensor = block.getFieldValue('SENSOR');
	const branch = generator.statementToCode(block, 'DO');
	return `if (car.isSensorActive(${sensor})) {\n${branch}}\n`;
};

onMounted(() => {
	if (blocklyDiv.value) {
		const toolbox = {
			kind: 'flyoutToolbox',
			contents: [
				{
					kind: 'block',
					type: 'queue_move_forward',
				},
				{
					kind: 'block',
					type: 'queue_turn_left',
				},
				{
					kind: 'block',
					type: 'queue_turn_right',
				},
				{
					kind: 'block',
					type: 'if_sensor_active',
				},
			],
		};

		workspace = Blockly.inject(blocklyDiv.value, {
			toolbox: toolbox,
			scrollbars: true,
			horizontalLayout: false,
			toolboxPosition: 'start',
			theme: Blockly.Themes.Zelos,
		});
	}
});

function runCode() {
	const code = javascriptGenerator.workspaceToCode(workspace);
	emit('run-code', code);
}
</script>
