#!/bin/bash

# Configuration
URL="http://10.0.2.2:3000" # Default to localhost (10.0.2.2 for emulator)

# Check if URL argument is provided
if [ ! -z "$1" ]; then
  URL="$1"
fi

echo "Opening $URL in Android Emulator..."
adb shell am start -a android.intent.action.VIEW -d "$URL"
