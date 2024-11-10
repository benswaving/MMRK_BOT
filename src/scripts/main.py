import os
import sys
import json
import time
import signal
import subprocess
from pathlib import Path
from trading_bot import TradingBot

class TradingSystem:
    def __init__(self):
        self.ui_process = None
        self.trading_bot = None
        self.config = self.load_config()

    def load_config(self):
        config_path = Path(__file__).parent / 'config.json'
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("Config file not found. Creating default configuration...")
            default_config = {
                "api_key": "",
                "api_secret": "",
                "api_passphrase": "",
                "trading_pairs": ["BTC-USDT", "ETH-USDT", "SOL-USDT"],
                "ui_port": 5173
            }
            with open(config_path, 'w') as f:
                json.dump(default_config, f, indent=2)
            return default_config

    def start_ui(self):
        """Start the Vite development server"""
        try:
            # Get the project root directory (2 levels up from scripts)
            project_root = Path(__file__).parent.parent.parent
            
            # Start the Vite development server
            self.ui_process = subprocess.Popen(
                ['npm', 'run', 'dev'],
                cwd=str(project_root),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            print(f"UI started on http://localhost:{self.config['ui_port']}")
            
            # Wait a bit to ensure the server starts
            time.sleep(2)
            
            # Check if the process is still running
            if self.ui_process.poll() is not None:
                print("Failed to start UI server. Check if Node.js and npm are installed.")
                return False
                
            return True
        except Exception as e:
            print(f"Error starting UI: {e}")
            return False

    def start_trading_bot(self):
        """Initialize and start the trading bot"""
        try:
            if not all([self.config['api_key'], self.config['api_secret'], self.config['api_passphrase']]):
                print("Please configure your API credentials in config.json")
                return False

            self.trading_bot = TradingBot(
                api_key=self.config['api_key'],
                api_secret=self.config['api_secret'],
                api_passphrase=self.config['api_passphrase']
            )
            
            # Start the bot with the configured trading pairs
            self.trading_bot.run(self.config['trading_pairs'])
            return True
        except Exception as e:
            print(f"Error starting trading bot: {e}")
            return False

    def stop(self):
        """Stop all running processes"""
        if self.ui_process:
            print("Stopping UI server...")
            self.ui_process.terminate()
            self.ui_process.wait()

        if self.trading_bot:
            print("Stopping trading bot...")
            self.trading_bot.stop()

    def run(self):
        """Run the complete trading system"""
        def signal_handler(signum, frame):
            print("\nShutting down...")
            self.stop()
            sys.exit(0)

        # Register signal handlers
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)

        print("Starting Trading System...")
        
        # Start UI
        if not self.start_ui():
            print("Failed to start UI. Exiting...")
            return

        # Start trading bot
        if not self.start_trading_bot():
            print("Failed to start trading bot. Stopping system...")
            self.stop()
            return

        print("\nTrading System is running!")
        print("Press Ctrl+C to stop")

        try:
            while True:
                # Keep the main thread alive and check processes
                if self.ui_process.poll() is not None:
                    print("UI server stopped unexpectedly. Restarting...")
                    if not self.start_ui():
                        break
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nShutting down...")
        finally:
            self.stop()

def main():
    trading_system = TradingSystem()
    trading_system.run()

if __name__ == "__main__":
    main()