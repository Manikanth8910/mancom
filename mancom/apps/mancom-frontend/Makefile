# Mancom App Makefile
# Usage: make <target>

.PHONY: setup ios android start test lint format clean help

# Default target
.DEFAULT_GOAL := help

# Setup - Install all dependencies
setup:
	@echo "Installing npm dependencies..."
	npm install
	@echo "Installing iOS pods..."
	cd ios && pod install && cd ..
	@echo "Setup complete!"

# iOS - Run on iOS simulator
ios:
	npx react-native run-ios

# Android - Run on Android emulator
android:
	npx react-native run-android

# Start Metro bundler
start:
	npx react-native start

# Start Metro with cache reset
start-clean:
	npx react-native start --reset-cache

# Run tests
test:
	npm test

# Run tests in watch mode
test-watch:
	npm run test:watch

# Run tests with coverage
test-coverage:
	npm run test:coverage

# Run TypeScript type checking
typecheck:
	npm run typecheck

# Run ESLint
lint:
	npm run lint

# Run ESLint with auto-fix
lint-fix:
	npm run lint:fix

# Format code with Prettier
format:
	npm run format

# Check formatting with Prettier
format-check:
	npm run format:check

# Clean build artifacts
clean:
	@echo "Cleaning node_modules..."
	rm -rf node_modules
	@echo "Cleaning iOS build..."
	rm -rf ios/Pods ios/Podfile.lock ios/build
	@echo "Cleaning Android build..."
	rm -rf android/build android/app/build
	@echo "Clean complete!"

# Clean watchman
clean-watchman:
	watchman watch-del-all

# Full clean and reinstall
reset: clean setup

# Reinstall pods
pods:
	cd ios && rm -rf Pods Podfile.lock && pod install && cd ..

# Build Android release
build-android:
	cd android && ./gradlew assembleRelease

# Build iOS release (requires proper signing)
build-ios:
	xcodebuild -workspace ios/MancomApp.xcworkspace \
		-scheme MancomApp \
		-configuration Release \
		-sdk iphoneos \
		archive

# Run all checks (CI simulation)
ci: typecheck lint format-check test
	@echo "All CI checks passed!"

# Help - Show available commands
help:
	@echo "Mancom App - Available Commands"
	@echo ""
	@echo "Setup & Run:"
	@echo "  make setup         - Install all dependencies"
	@echo "  make ios           - Run on iOS simulator"
	@echo "  make android       - Run on Android emulator"
	@echo "  make start         - Start Metro bundler"
	@echo "  make start-clean   - Start Metro with cache reset"
	@echo ""
	@echo "Testing:"
	@echo "  make test          - Run tests"
	@echo "  make test-watch    - Run tests in watch mode"
	@echo "  make test-coverage - Run tests with coverage"
	@echo ""
	@echo "Code Quality:"
	@echo "  make typecheck     - Run TypeScript check"
	@echo "  make lint          - Run ESLint"
	@echo "  make lint-fix      - Run ESLint with auto-fix"
	@echo "  make format        - Format code with Prettier"
	@echo "  make format-check  - Check formatting"
	@echo "  make ci            - Run all CI checks"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean         - Clean all build artifacts"
	@echo "  make reset         - Clean and reinstall"
	@echo "  make pods          - Reinstall iOS pods"
	@echo ""
	@echo "Build:"
	@echo "  make build-android - Build Android release"
	@echo "  make build-ios     - Build iOS release"
