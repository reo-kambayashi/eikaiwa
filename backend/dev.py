#!/usr/bin/env python3
"""
Development utility script for the English Communication App backend.

This script provides common development tasks like running the server,
formatting code, and running tests. It's designed to be beginner-friendly
and follows the requirements in AGENTS.md.

Usage:
    python dev.py --help          # Show all available commands
    python dev.py serve           # Start the development server
    python dev.py format          # Format code with black
    python dev.py test            # Run tests
    python dev.py check           # Check code formatting
"""

import argparse
import os
import subprocess
import sys


def run_command(command, description):
    """
    Run a shell command and handle errors gracefully.

    Args:
        command (list): Command and arguments to run
        description (str): Human-readable description of the command
    """
    print(f"🚀 {description}...")
    try:
        result = subprocess.run(
            command, check=True, cwd=os.path.dirname(__file__)
        )
        print(f"✅ {description} completed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed with exit code {e.returncode}")
        return False
    except FileNotFoundError:
        print(f"❌ Command not found: {' '.join(command)}")
        print("💡 Make sure you have activated the virtual environment:")
        print("   cd backend && uv venv .venv && source .venv/bin/activate")
        return False


def serve():
    """Start the development server with auto-reload."""
    return run_command(
        [
            "uv",
            "run",
            "uvicorn",
            "main:app",
            "--reload",
            "--host",
            "0.0.0.0",
            "--port",
            "8000",
        ],
        "Starting development server",
    )


def format_code():
    """Format Python code using black with line length 79."""
    return run_command(
        ["uv", "run", "black", "--line-length", "79", "."],
        "Formatting code with black",
    )


def check_format():
    """Check if code is properly formatted."""
    return run_command(
        ["uv", "run", "black", "--check", "--line-length", "79", "."],
        "Checking code formatting",
    )


def run_tests():
    """Run the test suite."""
    return run_command(["uv", "run", "pytest"], "Running tests")


def install_deps():
    """Install all dependencies."""
    return run_command(
        ["uv", "pip", "install", "-r", "requirements.txt"],
        "Installing dependencies",
    )


def main():
    """Main entry point for the development script."""
    parser = argparse.ArgumentParser(
        description="Development utility for English Communication App backend",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python dev.py serve      # Start development server
    python dev.py format     # Format all Python files
    python dev.py check      # Check formatting without changing files
    python dev.py test       # Run the test suite
    python dev.py install    # Install dependencies
        """,
    )

    parser.add_argument(
        "command",
        choices=["serve", "format", "check", "test", "install"],
        help="Command to run",
    )

    args = parser.parse_args()

    # Map commands to functions
    commands = {
        "serve": serve,
        "format": format_code,
        "check": check_format,
        "test": run_tests,
        "install": install_deps,
    }

    # Run the requested command
    success = commands[args.command]()

    if not success:
        sys.exit(1)

    print(f"🎉 Command '{args.command}' completed successfully!")


if __name__ == "__main__":
    main()
