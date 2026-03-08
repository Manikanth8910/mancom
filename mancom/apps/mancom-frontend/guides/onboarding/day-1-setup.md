# Day 1: Development Setup

This guide will help you set up your development environment for the Mancom React Native app.

## Prerequisites

Before you begin, ensure you have:

- macOS (for iOS development) or Linux/Windows (Android only)
- 8GB+ RAM recommended
- 20GB+ free disk space

## Step 1: Install Required Software

### Node.js (v20+)

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Verify
node --version  # Should show v20.x.x
```

### Watchman (macOS)

```bash
brew install watchman
```

### For iOS Development (macOS only)

1. Install Xcode from the App Store
2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. Accept Xcode license:
   ```bash
   sudo xcodebuild -license accept
   ```
4. Install CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```

### For Android Development

1. Install Android Studio from https://developer.android.com/studio
2. During installation, ensure these are selected:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
3. Set environment variables (add to `~/.bashrc` or `~/.zshrc`):
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
4. Create an Android Virtual Device (AVD) in Android Studio

## Step 2: Clone the Repository

```bash
git clone <repository-url>
cd mancom-app
```

## Step 3: Install Dependencies

```bash
# Install npm packages
npm install

# Install iOS pods (macOS only)
cd ios && pod install && cd ..
```

## Step 4: Run the App

### iOS (macOS only)

```bash
npm run ios

# Or using Makefile
make ios
```

### Android

```bash
# Start Android emulator first (or connect device)
npm run android

# Or using Makefile
make android
```

## Step 5: Verify Setup

You should see:

1. The Metro bundler running in a terminal
2. The app launching in simulator/emulator
3. The Login screen with "MANCOM" title

### Common Issues

**Metro bundler port in use:**
```bash
npx react-native start --reset-cache
```

**iOS build fails:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm run ios
```

**Android build fails:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

## Step 6: Configure Your Editor

### VS Code (Recommended)

Install these extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- React Native Tools

### Settings

Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Next Steps

- Continue to [Day 2: Codebase Tour](./day-2-codebase-tour.md)
- Review the [Architecture](../../docs/architecture.md) documentation
