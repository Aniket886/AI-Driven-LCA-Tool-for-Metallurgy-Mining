"""
Deployment script for the AI-Driven LCA Tool
Automates the setup process for development and production environments
"""

import os
import sys
import subprocess
import time
import json
import platform
from pathlib import Path

class LCAToolDeployer:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.backend_dir = self.project_root / "backend"
        self.frontend_dir = self.project_root / "frontend"
        self.is_windows = platform.system() == "Windows"
        
    def print_header(self, message):
        """Print a formatted header"""
        print("\n" + "="*60)
        print(f"🚀 {message}")
        print("="*60)
    
    def print_step(self, step, message):
        """Print a formatted step"""
        print(f"\n📋 Step {step}: {message}")
        print("-" * 40)
    
    def run_command(self, command, cwd=None, shell=True):
        """Run a command and return success status"""
        try:
            if cwd:
                print(f"Running in {cwd}: {command}")
            else:
                print(f"Running: {command}")
            
            result = subprocess.run(
                command,
                shell=shell,
                cwd=cwd,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print("✅ Success")
                if result.stdout.strip():
                    print(f"Output: {result.stdout.strip()}")
                return True
            else:
                print("❌ Failed")
                if result.stderr.strip():
                    print(f"Error: {result.stderr.strip()}")
                return False
                
        except Exception as e:
            print(f"❌ Exception: {e}")
            return False
    
    def check_prerequisites(self):
        """Check if required software is installed"""
        self.print_step(1, "Checking Prerequisites")
        
        prerequisites = [
            ("python", "python --version"),
            ("node", "node --version"),
            ("npm", "npm --version"),
            ("pip", "pip --version")
        ]
        
        missing = []
        
        for name, command in prerequisites:
            if self.run_command(command):
                print(f"✅ {name} is installed")
            else:
                print(f"❌ {name} is not installed or not in PATH")
                missing.append(name)
        
        if missing:
            print(f"\n❌ Missing prerequisites: {', '.join(missing)}")
            print("Please install the missing software and try again.")
            return False
        
        print("\n✅ All prerequisites are satisfied")
        return True
    
    def setup_python_environment(self):
        """Set up Python virtual environment and install dependencies"""
        self.print_step(2, "Setting up Python Environment")
        
        # Create virtual environment
        venv_path = self.project_root / "venv"
        if not venv_path.exists():
            if not self.run_command("python -m venv venv", cwd=self.project_root):
                return False
        else:
            print("✅ Virtual environment already exists")
        
        # Activate virtual environment and install dependencies
        if self.is_windows:
            activate_cmd = "venv\\Scripts\\activate"
            pip_cmd = "venv\\Scripts\\pip"
        else:
            activate_cmd = "source venv/bin/activate"
            pip_cmd = "venv/bin/pip"
        
        # Install backend dependencies
        requirements_file = self.project_root / "requirements.txt"
        if requirements_file.exists():
            install_cmd = f"{pip_cmd} install -r requirements.txt"
            if not self.run_command(install_cmd, cwd=self.project_root):
                return False
        else:
            print("❌ requirements.txt not found in project root")
            return False
        
        print("✅ Python environment setup complete")
        return True
    
    def setup_node_environment(self):
        """Set up Node.js environment and install dependencies"""
        self.print_step(3, "Setting up Node.js Environment")
        
        # Check if package.json exists
        package_json = self.frontend_dir / "package.json"
        if not package_json.exists():
            print("❌ package.json not found in frontend directory")
            return False
        
        # Install npm dependencies
        if not self.run_command("npm install", cwd=self.frontend_dir):
            return False
        
        print("✅ Node.js environment setup complete")
        return True
    
    def setup_database(self):
        """Set up the database"""
        self.print_step(4, "Setting up Database")
        
        # Check if PostgreSQL is available
        if self.run_command("psql --version"):
            print("✅ PostgreSQL detected")
            db_type = "postgresql"
        else:
            print("⚠️  PostgreSQL not found, using SQLite for development")
            db_type = "sqlite"
        
        # Set environment variables for database
        env_file = self.project_root / ".env"
        env_content = []
        
        if db_type == "sqlite":
            env_content.extend([
                "FLASK_ENV=development",
                "SECRET_KEY=dev-secret-key-change-in-production",
                "DB_TYPE=sqlite"
            ])
        else:
            env_content.extend([
                "FLASK_ENV=development",
                "SECRET_KEY=dev-secret-key-change-in-production",
                "DB_HOST=localhost",
                "DB_PORT=5432",
                "DB_NAME=lca_tool",
                "DB_USER=postgres",
                "DB_PASSWORD=password"
            ])
        
        # Write environment file
        with open(env_file, 'w') as f:
            f.write('\n'.join(env_content))
        
        print("✅ Environment configuration created")
        
        # Initialize database
        init_script = self.backend_dir / "database" / "init_db.py"
        if init_script.exists():
            if self.is_windows:
                python_cmd = "venv\\Scripts\\python"
            else:
                python_cmd = "venv/bin/python"
            
            init_cmd = f"{python_cmd} backend/database/init_db.py"
            if self.run_command(init_cmd, cwd=self.project_root):
                print("✅ Database initialized successfully")
            else:
                print("⚠️  Database initialization failed, but continuing...")
        
        return True
    
    def train_ml_models(self):
        """Train the ML models"""
        self.print_step(5, "Training ML Models")
        
        if self.is_windows:
            python_cmd = "venv\\Scripts\\python"
        else:
            python_cmd = "venv/bin/python"
        
        # Train models
        train_script = """
import sys
import os
sys.path.append('backend')
from ml_models.lca_predictor import LCAPredictor

print("Training ML models...")
predictor = LCAPredictor()
predictor.train_models()
predictor.save_models()
print("ML models trained and saved successfully!")
"""
        
        train_file = self.project_root / "train_models.py"
        with open(train_file, 'w') as f:
            f.write(train_script)
        
        if self.run_command(f"{python_cmd} train_models.py", cwd=self.project_root):
            print("✅ ML models trained successfully")
            os.remove(train_file)  # Clean up
            return True
        else:
            print("⚠️  ML model training failed, but continuing...")
            if train_file.exists():
                os.remove(train_file)
            return True  # Continue even if training fails
    
    def create_startup_scripts(self):
        """Create startup scripts for easy development"""
        self.print_step(6, "Creating Startup Scripts")
        
        # Backend startup script
        if self.is_windows:
            backend_script = """@echo off
echo Starting LCA Tool Backend...
cd /d "%~dp0"
call venv\\Scripts\\activate
cd backend
set FLASK_APP=app.py
set FLASK_ENV=development
python app.py
pause
"""
            backend_file = self.project_root / "start_backend.bat"
        else:
            backend_script = """#!/bin/bash
echo "Starting LCA Tool Backend..."
cd "$(dirname "$0")"
source venv/bin/activate
cd backend
export FLASK_APP=app.py
export FLASK_ENV=development
python app.py
"""
            backend_file = self.project_root / "start_backend.sh"
        
        with open(backend_file, 'w') as f:
            f.write(backend_script)
        
        if not self.is_windows:
            os.chmod(backend_file, 0o755)
        
        # Frontend startup script
        if self.is_windows:
            frontend_script = """@echo off
echo Starting LCA Tool Frontend...
cd /d "%~dp0\\frontend"
npm start
pause
"""
            frontend_file = self.project_root / "start_frontend.bat"
        else:
            frontend_script = """#!/bin/bash
echo "Starting LCA Tool Frontend..."
cd "$(dirname "$0")/frontend"
npm start
"""
            frontend_file = self.project_root / "start_frontend.sh"
        
        with open(frontend_file, 'w') as f:
            f.write(frontend_script)
        
        if not self.is_windows:
            os.chmod(frontend_file, 0o755)
        
        # Combined startup script
        if self.is_windows:
            combined_script = """@echo off
echo Starting AI-Driven LCA Tool...
echo.
echo This will start both backend and frontend servers.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C to stop the servers.
echo.
start "LCA Backend" cmd /k "start_backend.bat"
timeout /t 5 /nobreak > nul
start "LCA Frontend" cmd /k "start_frontend.bat"
echo.
echo Both servers are starting...
echo Check the new windows for server status.
pause
"""
            combined_file = self.project_root / "start_lca_tool.bat"
        else:
            combined_script = """#!/bin/bash
echo "Starting AI-Driven LCA Tool..."
echo
echo "This will start both backend and frontend servers."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo
echo "Press Ctrl+C to stop the servers."
echo

# Start backend in background
./start_backend.sh &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 5

# Start frontend in background
./start_frontend.sh &
FRONTEND_PID=$!

echo "Both servers are running..."
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Wait for user input to stop
read -p "Press Enter to stop the servers..."

# Kill both processes
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
echo "Servers stopped."
"""
            combined_file = self.project_root / "start_lca_tool.sh"
        
        with open(combined_file, 'w') as f:
            f.write(combined_script)
        
        if not self.is_windows:
            os.chmod(combined_file, 0o755)
        
        print("✅ Startup scripts created")
        return True
    
    def create_documentation(self):
        """Create quick start documentation"""
        self.print_step(7, "Creating Documentation")
        
        quick_start = """# Quick Start Guide

## AI-Driven LCA Tool - Smart India Hackathon 2025

### Prerequisites Installed ✅
- Python 3.8+
- Node.js 14+
- npm 6+

### Project Structure
```
├── backend/          # Flask API server
├── frontend/         # React web application
├── venv/            # Python virtual environment
├── .env             # Environment variables
└── start_*.bat/sh   # Startup scripts
```

### Quick Start

#### Option 1: Start Everything (Recommended)
```bash
# Windows
start_lca_tool.bat

# Linux/Mac
./start_lca_tool.sh
```

#### Option 2: Start Individually
```bash
# Start Backend (Terminal 1)
# Windows: start_backend.bat
# Linux/Mac: ./start_backend.sh

# Start Frontend (Terminal 2)  
# Windows: start_frontend.bat
# Linux/Mac: ./start_frontend.sh
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/health

### Test the API
```bash
# Activate virtual environment first
# Windows: venv\\Scripts\\activate
# Linux/Mac: source venv/bin/activate

# Run API tests
python backend/test_api.py
```

### Features
1. **Dashboard**: Overview of assessments and metrics
2. **New Assessment**: Create LCA assessments with AI predictions
3. **Compare Pathways**: Side-by-side comparison of production routes
4. **Visualizations**: Interactive charts and lifecycle flows
5. **Reports**: Generate PDF/CSV/Excel reports
6. **Help**: Comprehensive documentation and tutorials

### Troubleshooting
- Ensure all prerequisites are installed
- Check that ports 3000 and 5000 are available
- Verify virtual environment is activated for backend
- Check console logs for detailed error messages

### SIH Demo Ready! 🎉
The tool is configured for Smart India Hackathon demonstrations with:
- Sample data pre-loaded
- Fast AI predictions
- Professional UI/UX
- Comprehensive reporting
"""
        
        quick_start_file = self.project_root / "QUICK_START.md"
        with open(quick_start_file, 'w') as f:
            f.write(quick_start)
        
        print("✅ Quick start documentation created")
        return True
    
    def deploy(self):
        """Run the complete deployment process"""
        self.print_header("AI-Driven LCA Tool Deployment")
        
        steps = [
            self.check_prerequisites,
            self.setup_python_environment,
            self.setup_node_environment,
            self.setup_database,
            self.train_ml_models,
            self.create_startup_scripts,
            self.create_documentation
        ]
        
        for i, step in enumerate(steps, 1):
            if not step():
                print(f"\n❌ Deployment failed at step {i}")
                return False
        
        self.print_header("Deployment Complete! 🎉")
        print("""
✅ The AI-Driven LCA Tool has been successfully deployed!

🚀 Quick Start:
   1. Run: start_lca_tool.bat (Windows) or ./start_lca_tool.sh (Linux/Mac)
   2. Open: http://localhost:3000
   3. Explore the features and create your first LCA assessment!

📚 Documentation:
   - Read QUICK_START.md for detailed instructions
   - Check README.md for project overview
   - Visit the Help section in the application

🧪 Testing:
   - Run: python backend/test_api.py (after activating venv)
   - Test all API endpoints and functionality

🏆 SIH Ready:
   - Professional UI with Material Design
   - AI-powered predictions and insights
   - Comprehensive reporting capabilities
   - Interactive visualizations
   - Sample data for demonstrations

Happy coding! 🚀
""")
        return True

def main():
    """Main deployment function"""
    deployer = LCAToolDeployer()
    
    print("🌟 Welcome to the AI-Driven LCA Tool Deployment Script")
    print("This script will set up everything you need for development.")
    
    response = input("\nProceed with deployment? (y/n): ").lower().strip()
    if response != 'y':
        print("Deployment cancelled.")
        return
    
    success = deployer.deploy()
    
    if success:
        print("\n🎉 Deployment completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Deployment failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()