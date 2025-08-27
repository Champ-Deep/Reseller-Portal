import type { Config } from '@react-router/dev/config';

export default {
	appDirectory: './src/app',
	ssr: false,
	buildDirectory: './build',
	// Use preset to force SPA mode and avoid server route scanning
	preset: 'spa',
	future: {
		v3_singleFetch: true
	}
} satisfies Config;
