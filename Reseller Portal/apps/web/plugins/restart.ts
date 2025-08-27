import path from 'node:path';
import process from 'node:process';
import micromatch from 'micromatch';
import type { Plugin } from 'vite';

export interface VitePluginRestartOptions {
	/**
	 * Enable glob support for watcher (it's disabled by Vite, but add this plugin will turn it on by default)
	 *
	 * @default true
	 */
	glob?: boolean;
	/**
	 * @default 500
	 */
	delay?: number;
	/**
	 * Array of files to watch, changes to those file will trigger a server restart
	 */
	restart?: string | string[];
	/**
	 * Array of files to watch, changes to those file will trigger a client full page reload
	 */
	reload?: string | string[];
}

let i = 0;

function toArray<T>(arr: T | T[] | undefined): T[] {
	if (!arr) return [];
	if (Array.isArray(arr)) return arr;
	return [arr];
}

export function restart(options: VitePluginRestartOptions = {}): Plugin {
	const { delay = 1000, glob: enableGlob = true } = options; // Increased default delay

	let root = process.cwd();
	let reloadGlobs: string[] = [];
	let restartGlobs: string[] = [];

	let timerState = 'idle';
	let timer: ReturnType<typeof setTimeout> | undefined;
	let isRestarting = false;

	function clear() {
		clearTimeout(timer);
	}
	function schedule(fn: () => void, actionType: string) {
		// Prevent cascading restarts
		if (isRestarting && actionType === 'restart') {
			console.log('[vite-restart] ⚠️ Restart already in progress, ignoring...');
			return;
		}

		clear();
		timer = setTimeout(() => {
			if (actionType === 'restart') {
				isRestarting = true;
			}
			fn();
			if (actionType === 'restart') {
				// Reset flag after a delay to allow for server restart
				setTimeout(() => {
					isRestarting = false;
				}, 3000);
			}
		}, delay);
	}

	return {
		name: `vite-plugin-restart:${i++}`,
		apply: 'serve',
		config(c) {
			if (!enableGlob) return;
			if (!c.server) c.server = {};
			if (!c.server.watch) c.server.watch = {};
		},
		configResolved(config) {
			// famous last words, but this *appears* to always be an absolute path
			// with all slashes normalized to forward slashes `/`. this is compatible
			// with path.posix.join, so we can use it to make an absolute path glob
			root = config.root;

			restartGlobs = toArray(options.restart).map((i) =>
				path.posix.join(root, i)
			);
			reloadGlobs = toArray(options.reload).map((i) =>
				path.posix.join(root, i)
			);
		},
		configureServer(server) {
			server.watcher.add([...restartGlobs, ...reloadGlobs]);
			server.watcher.on('add', handleFileChange);
			server.watcher.on('unlink', handleFileChange);

			function handleFileChange(file: string) {
				const fileName = path.basename(file);
				
				if (micromatch.isMatch(file, restartGlobs)) {
					timerState = 'restart';
					console.log(`[vite-restart] 🔄 ${fileName} changed, scheduling server restart...`);
					schedule(() => {
						console.log(`[vite-restart] 🔄 Restarting server due to ${fileName}`);
						try {
							server.restart();
						} catch (error) {
							console.error(`[vite-restart] ❌ Restart failed:`, error);
							isRestarting = false; // Reset flag on error
						}
					}, 'restart');
				} else if (
					micromatch.isMatch(file, reloadGlobs) &&
					timerState !== 'restart'
				) {
					timerState = 'reload';
					console.log(`[vite-restart] 🔄 ${fileName} changed, scheduling page reload...`);
					schedule(() => {
						server.ws.send({ type: 'full-reload' });
						timerState = 'idle';
					}, 'reload');
				}
			}
		},
	};
}
