import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite'
import Fonts from 'unplugin-fonts/vite'
import Components from 'unplugin-vue-components/vite'
// Utilities
import Layouts from 'vite-plugin-vue-layouts-next'



const phasermsg = () => {
	return {
		name: 'phasermsg',
		buildStart() {
			process.stdout.write(`Building for production...\n`);
		},
		buildEnd() {
			const line =
				'---------------------------------------------------------';
			const msg = `❤️❤️❤️ Tell us about your game! - games@phaser.io ❤️❤️❤️`;
			process.stdout.write(`${line}\n${msg}\n${line}\n`);

			process.stdout.write(`✨ Done ✨\n`);
		},
	};
};

export default defineConfig({
	base: './',
	plugins: [
		vue(),
		phasermsg(),
		Layouts(),
		AutoImport({
			imports: ['vue'],
			dts: 'src/auto-imports.d.ts',
			eslintrc: {
				enabled: true,
			},
			vueTemplate: true,
		}),
		Components({
			dts: 'src/components.d.ts',
		}),
		Fonts({
			fontsource: {
				families: [
					{
						name: 'Roboto',
						weights: [100, 300, 400, 500, 700, 900],
						styles: ['normal', 'italic'],
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('../src', import.meta.url)),
		},
		extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
	},
	server: {
		port: 3000,
	},
	css: {
		preprocessorOptions: {
			sass: {
				api: 'modern-compiler',
			},
			scss: {
				api: 'modern-compiler',
			},
		},
	},
	logLevel: 'warning',
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					phaser: ['phaser'],
				},
			},
		},
		minify: 'terser',
		terserOptions: {
			compress: {
				passes: 2,
			},
			mangle: true,
			format: {
				comments: false,
			},
		},
	},
});
