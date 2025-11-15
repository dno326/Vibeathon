from app import create_app

app = create_app()

if __name__ == '__main__':
    # Use port 5001 to avoid conflict with macOS AirPlay Receiver on port 5000
    app.run(debug=True, port=5001)

