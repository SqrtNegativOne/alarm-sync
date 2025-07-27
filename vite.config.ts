import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
//import { defineConfig } from 'vite'; // Unused
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa';


const VitePWAConfig: Partial<VitePWAOptions> = {
	registerType: 'autoUpdate',
	includeAssets: ['favicon.svg', 'robots.txt'],
	manifest: {
		name: 'Alarm Sync',
		short_name: 'A.Sync.',
		start_url: '/',
		display: 'standalone',
		background_color: '#ffffff',
		theme_color: '#000000',
		icons: [
			{
				src: '/pwa-192x192.png',
				sizes: '192x192',
				type: 'image/png'
			},
			{
				src: '/pwa-512x512.png',
				sizes: '512x512',
				type: 'image/png'
			}
		]
	}
}

export default {
	plugins: [
		tailwindcss(),
		sveltekit(),
		VitePWA(VitePWAConfig),
	]
};
