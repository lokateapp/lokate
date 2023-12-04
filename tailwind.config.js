import { join } from 'path';
import { skeleton } from '@skeletonlabs/tw-plugin';

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	theme: {
		extend: {}
	},
	plugins: [
		require('daisyui'),
		require('flowbite/plugin'),
		skeleton({
			themes: { preset: [ "skeleton", "modern", "crimson" ]  }
		})
		// skeleton({
		// 	themes: { preset: ['wintry'] }
		// })
	]
};
