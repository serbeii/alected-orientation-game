<script setup lang="ts">
import { ref, toRaw } from 'vue';
import PhaserGame from './PhaserGame.vue';
import { RaceTemplate } from './game/scenes/RaceTemplate';

const phaserRef = ref();

const runBlocklyCode = (code: string) => {
	const scene = toRaw(phaserRef.value.scene) as RaceTemplate;
	try {
		scene.runCarCode(code);
	} catch (error) {
		console.error(error);
	}
};
const resetScene = () => {
	const scene = toRaw(phaserRef.value.scene) as RaceTemplate;
	try {
		scene.resetScene();
	} catch (error) {
		console.error(error);
	}
};

const stopCode = () => {
	const scene = toRaw(phaserRef.value.scene) as RaceTemplate;
	try {
		scene.stopCarCode();
	} catch (error) {
		console.error(error);
	}
};
</script>

<template>
	<div class="app-container">
		<div class="game-panel">
			<PhaserGame ref="phaserRef" />
		</div>
		<div class="editor-panel">
			<BlocklyEditor
				@run-code="runBlocklyCode"
				@reset-scene="resetScene"
				@stop-code="stopCode"
			/>
		</div>
	</div>
</template>

<style scoped>
.app-container {
	display: flex;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	position: relative;
}

.game-panel {
	flex: 1;
	min-width: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f0f0f0;
	position: relative;
	z-index: 1;
	padding: 8px;
	box-sizing: border-box;
	border-right: 2px solid #ddd;
}

.editor-panel {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	position: relative;
	z-index: 1;
	padding: 8px;
	box-sizing: border-box;
	background: #fff;
	overflow: hidden;
}

/* Ensure Blockly workspace doesn't overflow */
.editor-panel :deep(.blocklyDiv) {
	position: relative !important;
	z-index: 2 !important;
	max-width: 100% !important;
	max-height: 100% !important;
	overflow: hidden !important;
}

/* Prevent Blockly toolbox from overlapping */
.editor-panel :deep(.blocklyToolboxDiv) {
	z-index: 3 !important;
	position: relative !important;
}

/* Ensure Blockly flyout doesn't extend beyond panel */
.editor-panel :deep(.blocklyFlyout) {
	z-index: 4 !important;
	max-width: 100% !important;
}

/* Responsive breakpoint for smaller screens */
@media (max-width: 768px) {
	.app-container {
		flex-direction: column;
	}

	.game-panel {
		border-right: none;
		border-bottom: 2px solid #ddd;
	}

	.game-panel,
	.editor-panel {
		flex: 1;
		min-height: 0;
		padding: 4px;
	}
}

/* Very small screens */
@media (max-width: 480px) {
	.app-container {
		height: 100vh;
	}

	.game-panel {
		flex: 0 0 40%;
		min-height: 200px;
		padding: 2px;
	}

	.editor-panel {
		flex: 1;
		min-height: 300px;
		padding: 2px;
	}
}

/* Additional safety for any absolute positioned elements */
.game-panel * {
	max-width: 100%;
	max-height: 100%;
}

.editor-panel * {
	max-width: 100%;
}
</style>