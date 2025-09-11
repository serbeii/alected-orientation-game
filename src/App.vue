<script setup lang="ts">
import { ref, toRaw } from 'vue';
import PhaserGame from './PhaserGame.vue';
import { RaceTemplate } from './game/scenes/RaceTemplate';

const phaserRef = ref();

const runBlocklyCode = (code: string) => {
	const scene = toRaw(phaserRef.value.scene) as RaceTemplate;
	console.log(code);
	try {
		scene.runCarCode(code)
	} catch (error) {
		console.error(error)
	}
};
</script>

<template>
	<div>
		<PhaserGame ref="phaserRef" />
		<BlocklyEditor @run-code="runBlocklyCode" />
	</div>
</template>