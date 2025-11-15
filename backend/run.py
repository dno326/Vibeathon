#!/usr/bin/env python3
"""Run the Flask development server."""
from app.main import app

if __name__ == '__main__':
    # Run on port 5001 to avoid conflict with macOS AirPlay Receiver on port 5000
    app.run(host='0.0.0.0', port=5001, debug=True)

