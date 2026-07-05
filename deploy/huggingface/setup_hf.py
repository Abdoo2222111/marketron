#!/usr/bin/env python3
# ============================================================
# HG (Взлом) — Hugging Face Setup & Upload Script
# This script helps you deploy to Hugging Face Spaces
# ============================================================

import os
import sys
import subprocess
import argparse
from pathlib import Path

# Configuration
REQUIRED_FILES = [
    'app.py',
    'server.py',
    'keep_alive.py',
    'start.sh',
    'requirements.txt',
    'Dockerfile',
    'README.md',
    '.gitignore'
]

def check_git():
    """Check if git is available"""
    try:
        subprocess.run(['git', '--version'], check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def check_hf_cli():
    """Check if huggingface-cli is installed"""
    try:
        subprocess.run(['huggingface-cli', '--version'], check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def generate_upload_commands(username, space_name):
    """Generate the git commands for uploading"""
    repo_url = f"https://huggingface.co/spaces/{username}/{space_name}"
    
    commands = f"""
# ============================================================
# Hugging Face Upload Commands
# ============================================================
# Run these commands in your terminal:

# 1. Install Hugging Face CLI (if not already)
pip install huggingface_hub

# 2. Login to HF
huggingface-cli login
# (Enter your token when prompted)

# 3. Clone the Space repository
git clone {repo_url}
cd {space_name}

# 4. Copy all files from deploy/huggingface/ to this directory
cp -r ../deploy/huggingface/* .

# 5. Commit and push
git add .
git commit -m "Initial deployment - permanent server"
git push

# ============================================================
# Alternative: Using GitHub Actions (Recommended)
# ============================================================
# 1. Push code to GitHub
# 2. Link HF Space to GitHub repo in Space settings
# 3. Enable auto-deploy on push

# ============================================================
# Useful Links:
# - Space URL: https://huggingface.co/spaces/{username}/{space_name}
# - Logs: https://huggingface.co/spaces/{username}/{space_name}/logs
# - Settings: https://huggingface.co/spaces/{username}/{space_name}/settings
    """
    
    return commands

def create_hf_yaml(username, space_name):
    """Create a YAML configuration file for HF"""
    yaml_content = f"""title: "HG (Взлом) — Permanent Server"
emoji: "🚀"
colorFrom: "green"
colorTo: "blue"
sdk: docker
sdk_version: "1.0"
app_file: app.py
pinned: false
"""
    
    with open('huggingface.yaml', 'w') as f:
        f.write(yaml_content)
    
    print("✅ Generated huggingface.yaml")

def main():
    parser = argparse.ArgumentParser(description='Setup Hugging Face deployment')
    parser.add_argument('--username', '-u', help='Hugging Face username', required=False)
    parser.add_argument('--space-name', '-s', help='Space name', default='hg-hack-server')
    parser.add_argument('--generate-only', '-g', action='store_true', help='Only generate files, do not upload')
    
    args = parser.parse_args()
    
    print("=" * 50)
    print("🚀 HG (Взлом) — Hugging Face Setup")
    print("=" * 50)
    print()
    
    # Check if we're in the right directory
    if not os.path.isfile('app.py'):
        print("❌ Error: app.py not found. Please run this script from the deploy/huggingface/ directory.")
        sys.exit(1)
    
    print("📋 Checking required files...")
    missing_files = []
    for file in REQUIRED_FILES:
        if not os.path.isfile(file):
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Missing files: {', '.join(missing_files)}")
        print("Please ensure all required files are present.")
        sys.exit(1)
    
    print(f"✅ All {len(REQUIRED_FILES)} required files found")
    print()
    
    # Generate huggingface.yaml
    create_hf_yaml(args.username, args.space_name)
    
    if args.generate_only:
        print("✅ Files generated. Manual upload required.")
        return
    
    # Generate upload commands
    if not args.username:
        print("⚠️  No username provided. Generating manual upload instructions...")
        args.username = "YOUR_USERNAME"
    
    commands = generate_upload_commands(args.username, args.space_name)
    
    # Save upload instructions
    with open('UPLOAD_INSTRUCTIONS.md', 'w') as f:
        f.write(commands)
    
    print("✅ Generated UPLOAD_INSTRUCTIONS.md")
    print()
    print("=" * 50)
    print("📤 Ready to upload!")
    print("=" * 50)
    print()
    print(f"Next steps:")
    print(f"1. Read UPLOAD_INSTRUCTIONS.md")
    print(f"2. Follow the git commands to upload to HF")
    print(f"3. Or use the GitHub Actions workflow")
    print()
    print(f"Space URL: https://huggingface.co/spaces/{args.username}/{args.space_name}")
    print()
    print("🚀 Good luck!")

if __name__ == '__main__':
    main()
