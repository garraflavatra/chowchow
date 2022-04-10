import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

const bundle = config => ({
	...config,
	input: 'src/index.ts',
	external: id => !/^[./]/.test(id)
});

export default [
	bundle({
		plugins: [esbuild()],
		output: [
			{ file: 'dist/index.js', format: 'cjs' },
			{ file: 'dist/index.mjs', format: 'es' },
		]
	}),
	bundle({
		plugins: [dts()],
		output: {
			file: 'dist/index.d.ts',
			format: 'es',
		}
	}),
];
