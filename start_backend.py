#!/usr/bin/env python3
"""
Simple script to start the LCA Tool backend server
"""

import os
import sys
import subprocess

def main():
    print("🚀 Starting AI-Driven LCA Tool Backend...")
    
    # Change to backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    os.chdir(backend_dir)
    
    # Start the Flask application
    try:
        subprocess.run([sys.executable, 'app.py'], check=True)
    except KeyboardInterrupt:
        print("\n👋 Backend server stopped")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")

if __name__ == '__main__':
    main()