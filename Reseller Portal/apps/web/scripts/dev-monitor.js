#!/usr/bin/env node

/**
 * Development Server Monitor
 * Monitors the development server health and provides restart capabilities
 */

import { spawn } from 'child_process';
import { createServer } from 'http';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

class DevServerMonitor {
  constructor() {
    this.devProcess = null;
    this.isRestarting = false;
    this.restartCount = 0;
    this.lastRestartTime = 0;
    this.healthCheckPort = 4000;
  }

  async start() {
    log('🚀 Starting Lake B2B Development Server Monitor', 'cyan');
    log('📊 Monitoring server health and handling graceful restarts', 'blue');
    
    this.startDevServer();
    this.setupProcessHandlers();
    this.startHealthMonitoring();
  }

  startDevServer() {
    if (this.devProcess) {
      log('⚠️ Development server already running, terminating first...', 'yellow');
      this.devProcess.kill('SIGTERM');
    }

    log('🔄 Starting development server...', 'blue');
    
    this.devProcess = spawn('npm', ['run', 'dev'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd(),
      env: { ...process.env }
    });

    this.devProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(output);
      }
    });

    this.devProcess.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('ExperimentalWarning')) {
        log(`Error: ${output}`, 'red');
      }
    });

    this.devProcess.on('close', (code) => {
      if (code !== 0 && !this.isRestarting) {
        log(`❌ Development server exited with code ${code}`, 'red');
        this.handleUnexpectedExit();
      }
    });

    this.devProcess.on('error', (error) => {
      log(`❌ Failed to start development server: ${error.message}`, 'red');
    });
  }

  async handleUnexpectedExit() {
    const now = Date.now();
    const timeSinceLastRestart = now - this.lastRestartTime;
    
    // Prevent rapid restart loops
    if (timeSinceLastRestart < 5000) {
      this.restartCount++;
      if (this.restartCount > 3) {
        log('🚨 Too many rapid restarts, stopping monitor', 'red');
        process.exit(1);
      }
    } else {
      this.restartCount = 0;
    }

    log(`🔄 Attempting automatic restart (${this.restartCount + 1}/3)...`, 'yellow');
    this.lastRestartTime = now;
    
    // Wait a bit before restarting
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.startDevServer();
  }

  async gracefulRestart() {
    if (this.isRestarting) {
      log('⚠️ Restart already in progress...', 'yellow');
      return;
    }

    this.isRestarting = true;
    log('🔄 Initiating graceful restart...', 'blue');

    try {
      if (this.devProcess) {
        // Send graceful shutdown signal
        this.devProcess.kill('SIGTERM');
        
        // Wait for graceful shutdown
        await new Promise(resolve => {
          const timeout = setTimeout(() => {
            log('⚠️ Graceful shutdown timeout, forcing termination', 'yellow');
            if (this.devProcess) {
              this.devProcess.kill('SIGKILL');
            }
            resolve();
          }, 5000);

          if (this.devProcess) {
            this.devProcess.on('close', () => {
              clearTimeout(timeout);
              resolve();
            });
          } else {
            clearTimeout(timeout);
            resolve();
          }
        });
      }

      // Wait a moment before starting
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.startDevServer();
      
      log('✅ Graceful restart completed', 'green');
    } catch (error) {
      log(`❌ Graceful restart failed: ${error.message}`, 'red');
    } finally {
      this.isRestarting = false;
    }
  }

  async checkServerHealth() {
    try {
      const response = await fetch(`http://localhost:${this.healthCheckPort}/api/health`, {
        timeout: 3000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  startHealthMonitoring() {
    // Check server health every 30 seconds
    setInterval(async () => {
      const isHealthy = await this.checkServerHealth();
      if (!isHealthy && this.devProcess && !this.isRestarting) {
        log('🚨 Server health check failed, initiating restart...', 'red');
        this.gracefulRestart();
      }
    }, 30000);
  }

  setupProcessHandlers() {
    // Handle restart signals
    process.on('SIGUSR1', () => {
      log('📡 Received restart signal (SIGUSR1)', 'cyan');
      this.gracefulRestart();
    });

    process.on('SIGUSR2', () => {
      log('📡 Received restart signal (SIGUSR2)', 'cyan');
      this.gracefulRestart();
    });

    // Handle shutdown signals
    ['SIGTERM', 'SIGINT'].forEach(signal => {
      process.on(signal, () => {
        log(`📡 Received ${signal}, shutting down monitor...`, 'cyan');
        if (this.devProcess) {
          this.devProcess.kill('SIGTERM');
        }
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      log(`💥 Uncaught exception: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      log(`💥 Unhandled rejection: ${reason}`, 'red');
      console.error(reason);
      process.exit(1);
    });
  }
}

// Start monitor if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new DevServerMonitor();
  monitor.start().catch(error => {
    log(`💥 Monitor failed to start: ${error.message}`, 'red');
    process.exit(1);
  });
}