#!/usr/bin/env python3
"""
Directory structure explorer for Marketing Platform
"""
import os
import json

def explore_directory(path, max_depth=3, current_depth=0, exclude_dirs=None):
    if exclude_dirs is None:
        exclude_dirs = {
            '__pycache__', '.git', '.github', 'node_modules', 
            'venv', '.vscode', '.idea', 'dist', 'build'
        }
    
    result = {
        'path': path,
        'type': 'directory' if os.path.isdir(path) else 'file',
        'depth': current_depth,
        'contents': []
    }
    
    if current_depth >= max_depth:
        return result
    
    if not os.path.exists(path):
        return result
    
    try:
        entries = os.listdir(path)
        for entry in sorted(entries):
            if entry in exclude_dirs:
                continue
            
            full_path = os.path.join(path, entry)
            entry_info = explore_directory(full_path, max_depth, current_depth + 1, exclude_dirs)
            result['contents'].append(entry_info)
    except PermissionError:
        result['contents'].append({'name': 'permission-denied', 'type': 'error'})
    
    return result

def main():
    root_path = "D:/marketing-platform"
    
    if not os.path.exists(root_path):
        print(f"Path does not exist: {root_path}")
        return
    
    structure = explore_directory(root_path)
    
    # Save structure to JSON file
    with open('directory_structure.json', 'w', encoding='utf-8') as f:
        json.dump(structure, f, ensure_ascii=False, indent=2)
    
    print("Directory structure saved to directory_structure.json")
    
    # Print summary
    def print_summary(node, indent=0):
        name = node.get('name', os.path.basename(node['path']))
        node_type = node.get('type', 'unknown')
        prefix = '  ' * indent
        
        print(f"{prefix}{name} ({node_type})")
        
        for child in node.get('contents', []):
            print_summary(child, indent + 1)
    
    print_summary(structure)

if __name__ == "__main__":
    main()
