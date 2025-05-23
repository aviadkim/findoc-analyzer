"""
Script to run all OpenRouter integration tests.
"""
import os
import sys
import argparse
import subprocess
from pathlib import Path

def run_command(command, cwd=None):
    """Run a command and print the output."""
    print(f"Running command: {command}")
    process = subprocess.Popen(
        command,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd=cwd
    )
    stdout, stderr = process.communicate()

    if stdout:
        print(stdout)
    if stderr:
        print(stderr)

    return process.returncode

def main():
    """Run all OpenRouter integration tests."""
    parser = argparse.ArgumentParser(description="Run OpenRouter Integration Tests")
    parser.add_argument("--api-key", help="OpenRouter API key")
    args = parser.parse_args()

    # Get API key from arguments or environment
    api_key = args.api_key or os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("Error: OpenRouter API key is required. Provide it with --api-key or set OPENROUTER_API_KEY environment variable.")
        return 1

    # Get the current directory
    current_dir = Path(__file__).parent

    # Set up the API key
    print("Setting up OpenRouter API key...")
    setup_script = current_dir / "backend/scripts/setup_openrouter_key.py"
    if not setup_script.exists():
        print(f"Error: Setup script not found: {setup_script}")
        return 1

    returncode = run_command(f"python {setup_script} --api-key {api_key}")
    if returncode != 0:
        print("Error setting up OpenRouter API key.")
        return 1

    # Test the API key
    print("\nTesting OpenRouter API key...")
    test_script = current_dir / "test_openrouter_api.py"
    if not test_script.exists():
        print(f"Error: Test script not found: {test_script}")
        return 1

    returncode = run_command(f"python {test_script} --api-key {api_key}")
    if returncode != 0:
        print("Error testing OpenRouter API key.")
        return 1

    # Run the simple agent test
    print("\nRunning simple agent test...")
    agent_test_script = current_dir / "backend/examples/simple_agent_test.py"
    if not agent_test_script.exists():
        print(f"Error: Agent test script not found: {agent_test_script}")
        return 1

    returncode = run_command(f"python {agent_test_script} --api-key {api_key}")
    if returncode != 0:
        print("Error running simple agent test.")
        return 1

    print("\nAll tests completed successfully!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
