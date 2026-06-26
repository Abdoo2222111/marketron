#!/usr/bin/env python3
"""
Utility to create a structured summary of the Marketing Platform codebase
"""
import os
import json

def collect_stats(root_path):
    """Collect comprehensive statistics about the codebase"""
    stats = {
        "structure": {},
        "files_by_type": {},
        "total_files": 0,
        "total_directories": 0,
        "key_config_files": [],
        "main_languages": {},
        "possible_frameworks": []
    }
    
    def walk_directory(path, depth=0, max_depth=3):
        if depth >= max_depth:
            return
        
        try:
            entries = os.listdir(path)
            for entry in entries:
                if entry.startswith('.') or entry in ['__pycache__', 'node_modules']:
                    continue
                
                full_path = os.path.join(path, entry)
                rel_path = os.path.relpath(full_path, root_path)
                
                if os.path.isdir(full_path):
                    # Directory entry
                    if 'directories' not in stats["structure"]:
                        stats["structure"]["directories"] = []
                    
                    dir_info = {
                        "name": entry,
                        "path": rel_path,
                        "depth": depth
                    }
                    stats["structure"]["directories"].append(dir_info)
                    stats["total_directories"] += 1
                    
                    # Recursively explore
                    walk_directory(full_path, depth + 1, max_depth)
                else:
                    # File entry
                    if 'files' not in stats["structure"]:
                        stats["structure"]["files"] = []
                    
                    ext = os.path.splitext(entry)[1].lower()
                    file_info = {
                        "name": entry,
                        "extension": ext,
                        "path": rel_path,
                        "size": os.path.getsize(full_path) if os.path.exists(full_path) else 0
                    }
                    stats["structure"]["files"].append(file_info)
                    stats["files_by_type"][ext] = stats["files_by_type"].get(ext, 0) + 1
                    stats["total_files"] += 1
                    
                    # Track main languages
                    if ext in ['.ts', '.js']:
                        stats["main_languages"]["JavaScript/TypeScript"] = stats["main_languages"].get("JavaScript/TypeScript", 0) + 1
                    elif ext == '.py':
                        stats["main_languages"]["Python"] = stats["main_languages"].get("Python", 0) + 1
                    elif ext == '.md':
                        stats["main_languages"]["Markdown"] = stats["main_languages"].get("Markdown", 0) + 1
        except PermissionError:
            pass
    
    walk_directory(root_path)
    
    # Identify key configuration files
    key_files = [
        'backend/package.json',
        'ai-services/package.json',
        'ai-services/requirements.txt',
        'backend/.env.example',
        'ai-services/.env.example',
        'backend/prisma/schema.prisma',
        'README.md'
    ]
    
    for key_file in key_files:
        full_path = os.path.join(root_path, key_file)
        if os.path.exists(full_path):
            stats["key_config_files"].append({
                "name": key_file,
                "exists": True,
                "path": full_path
            })
        else:
            stats["key_config_files"].append({
                "name": key_file,
                "exists": False,
                "path": full_path
            })
    
    # Identify possible frameworks based on files
    frameworks = []
    
    # Check for Express/Node.js
    node_files = [f for f in stats["structure"].get("files", []) if f["name"] in ['package.json', 'server.ts', 'app.ts']]
    if node_files:
        frameworks.append({"name": "Node.js/Express", "evidence": "package.json, server.ts, app.ts"})
    
    # Check for FastAPI
    fastapi_files = [f for f in stats["structure"].get("files", []) if f["name"] in ['main.py', 'requirements.txt']]
    if fastapi_files:
        frameworks.append({"name": "FastAPI", "evidence": "main.py, requirements.txt"})
    
    # Check for React
    react_files = [f for f in stats["structure"].get("files", []) if f["name"] in ['package.json', 'vite.config.js']]
    if react_files:
        frameworks.append({"name": "React/Vite", "evidence": "package.json, vite config"})
    
    stats["possible_frameworks"] = frameworks
    
    return stats

def print_formatted_stats(stats):
    """Print statistics in a readable format"""
    print("=" * 60)
    print("MARKETING PLATFORM CODEBASE STATISTICS")
    print("=" * 60)
    
    print(f"\n📊 OVERALL SUMMARY")
    print(f"Total files: {stats['total_files']}")
    print(f"Total directories: {stats['total_directories']}")
    
    print(f"\n📁 MAIN LANGUAGES")
    for lang, count in stats["main_languages"].items():
        print(f"  {lang}: {count} files")
    
    print(f"\n📄 FILES BY EXTENSION")
    for ext, count in sorted(stats["files_by_type"].items(), key=lambda x: x[1], reverse=True):
        print(f"  {ext or '(no extension)'}: {count}")
    
    print(f"\n🔧 KEY CONFIGURATION FILES")
    for file_info in stats["key_config_files"]:
        status = "✅" if file_info["exists"] else "❌"
        print(f"  {status} {file_info['name']}")
    
    print(f"\n🚀 POSSIBLE FRAMEWORKS")
    for framework in stats["possible_frameworks"]:
        print(f"  • {framework['name']}")
        print(f"    Evidence: {framework['evidence']}")

def save_stats_to_file(stats, output_path="codebase_stats.json"):
    """Save statistics to a JSON file"""
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(stats, f, ensure_ascii=False, indent=2)
        print(f"\n📝 Statistics saved to: {output_path}")
    except Exception as e:
        print(f"Error saving stats to file: {e}")

def main():
    root_path = "D:/marketing-platform"
    
    print("Analyzing Marketing Platform codebase structure...")
    
    if not os.path.exists(root_path):
        print(f"Error: Path does not exist: {root_path}")
        return
    
    stats = collect_stats(root_path)
    
    # Print formatted statistics
    print_formatted_stats(stats)
    
    # Save to file
    save_stats_to_file(stats)
    
    print("\n✅ Analysis complete!")

if __name__ == "__main__":
    main()
