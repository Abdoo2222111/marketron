#!/usr/bin/env python3
"""Fix template literal backticks in openai.ts"""
import os

path = r'D:\marketing-platform\ai-services\utils\openai.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace corrupted closing backticks (single quote ' where backtick ` should be)
content = content.replace("JSON دقيق.',", "JSON دقيق.`,")
content = content.replace("JSON دقيق.'\n", "JSON دقيق.`\n")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed openai.ts template literal closures")
