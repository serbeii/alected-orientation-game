<script setup lang="ts">
import { ref, toRaw } from 'vue';
import PhaserGame from './PhaserGame.vue';
import { MainMenu } from './game/scenes/MainMenu';

const phaserRef = ref();

const runBlocklyCode = (code: string) => {
	const scene = toRaw(phaserRef.value.scene) as MainMenu;
	console.log(code);
};
</script>

<template>
	<div>
		<PhaserGame ref="phaserRef" />
		<BlocklyEditor @run-code="runBlocklyCode" />
	</div>
</template>