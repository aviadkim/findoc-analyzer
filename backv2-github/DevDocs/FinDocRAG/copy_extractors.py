"""
Script to copy extractors to the current directory.
"""

import os
import shutil
import sys

# Get the source and destination paths
src_dir = os.path.join(os.path.dirname(__file__), 'src', 'extractors')
dest_dir = os.path.dirname(__file__)

# Create the destination directory if it doesn't exist
os.makedirs(dest_dir, exist_ok=True)

# Copy the files
files_to_copy = ['grid_analyzer.py', 'enhanced_securities_extractor.py', '__init__.py']
for file in files_to_copy:
    src_file = os.path.join(src_dir, file)
    dest_file = os.path.join(dest_dir, file)
    
    if os.path.exists(src_file):
        print(f"Copying {src_file} to {dest_file}")
        shutil.copy2(src_file, dest_file)
    else:
        print(f"Source file not found: {src_file}")

print("Done copying files")
