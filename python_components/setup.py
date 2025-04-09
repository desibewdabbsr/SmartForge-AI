import subprocess
import sys
import os

def install_dependencies():
    """Install all required dependencies"""
    dependencies = [
        "flask",
        "flask-socketio",
        "flask-cors",
        "python-socketio[asyncio]",
        "eventlet",
        "pytest",
        "pytest-asyncio"
    ]
    
    print("Installing dependencies...")
    for dep in dependencies:
        print(f"Installing {dep}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", dep])
    
    print("All dependencies installed successfully!")

def create_init_files():
    """Create __init__.py files in all directories"""
    directories = [
        ".",
        "core",
        "core/server",
        "core/ai_integration",
        "ai_models_controller",
        "ai_models_controller/ai_config",
        "utils"
    ]
    
    print("Creating __init__.py files...")
    for directory in directories:
        init_file = os.path.join(directory, "__init__.py")
        if not os.path.exists(init_file):
            with open(init_file, "w") as f:
                f.write("# Auto-generated __init__.py file\n")
            print(f"Created {init_file}")
    
    print("All __init__.py files created!")

if __name__ == "__main__":
    install_dependencies()
    create_init_files()
    print("\nSetup complete! You can now run the server with:")
    print("python run_server.py")