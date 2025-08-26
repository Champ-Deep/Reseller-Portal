import type { Plugin } from 'vite';
import path from 'node:path';
import fs from 'node:fs';

let isRestarting = false;
let restartTimer: NodeJS.Timeout | null = null;

export function restartEnvFileChange(): Plugin {
  return {
    name: 'watch-env-and-graceful-restart',
    config(config, env) {
      const root = config.root || process.cwd();
      const mode = env.mode || 'development';

      const filesToWatch = [
        '.env',
        '.env.local',
        `.env.${mode}`,
        `.env.${mode}.local`,
      ]
        .map((f) => path.resolve(root, f))
        .filter((file) => fs.existsSync(file));

      for (const file of filesToWatch) {
        fs.watch(file, { persistent: false }, () => {
          const fileName = path.basename(file);
          
          // Debounce rapid file changes
          if (isRestarting) {
            console.log(`[vite] ${fileName} change detected but restart already in progress...`);
            return;
          }
          
          if (restartTimer) {
            clearTimeout(restartTimer);
          }
          
          console.log(`[vite] 🔄 ${fileName} changed. Scheduling graceful restart in 1 second...`);
          
          restartTimer = setTimeout(() => {
            isRestarting = true;
            console.log(`[vite] 🔄 Restarting development server due to ${fileName} changes...`);
            
            // Try graceful restart first
            try {
              // Send restart signal instead of force exit
              process.kill(process.pid, 'SIGUSR2');
            } catch (error) {
              // Fallback to exit if graceful restart fails
              console.log(`[vite] ⚠️  Graceful restart failed, using fallback exit...`);
              process.exit(0);
            }
          }, 1000); // 1 second delay to debounce changes
        });
      }
    },
    configureServer(server) {
      // Handle graceful shutdown
      process.on('SIGUSR2', () => {
        console.log('[vite] 🔄 Received restart signal, shutting down gracefully...');
        server.close(() => {
          console.log('[vite] ✅ Server closed gracefully. Please restart manually.');
          process.exit(0);
        });
      });
    },
  };
}
