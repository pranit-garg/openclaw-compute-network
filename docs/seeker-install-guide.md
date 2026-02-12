# Seeker Installation Guide

## Prerequisites

- Solana Seeker device (or any Android phone for testing)
- Mac with USB-C cable
- ADB installed (Android Debug Bridge)

### Verify ADB is available

```bash
# ADB should be at this path (from your Android SDK):
/Users/pranitgarg/Library/Android/sdk/platform-tools/adb version

# Or if it's in your PATH:
adb version
```

If ADB isn't found, install via:
```bash
brew install android-platform-tools
```

---

## Step-by-Step Installation

### 1. Enable Developer Options on Seeker

1. Open **Settings** on your Seeker
2. Scroll down to **About Phone**
3. Tap **Build Number** 7 times rapidly
4. You'll see "You are now a developer!" toast message

### 2. Enable USB Debugging

1. Go back to **Settings**
2. Open **Developer Options** (now visible near bottom)
3. Toggle **USB Debugging** ON
4. Confirm the dialog

### 3. Connect to Mac

1. Plug your Seeker into your Mac via USB-C
2. On the Seeker, you'll see an RSA key fingerprint prompt
3. Tap **Allow** (optionally check "Always allow from this computer")

### 4. Verify Connection

```bash
adb devices
```

You should see your device listed:
```
List of devices attached
XXXXXXXXXX	device
```

If it shows `unauthorized`, re-check the RSA key prompt on the phone.

### 5. Install the Dispatch APK

**Option A: From local file**
```bash
adb install /Users/pranitgarg/Vibecoding/Dispatch/mobile/seeker-solana/build-1770731703429.apk
```

**Option B: Download latest from EAS**
```bash
# Get the URL from: npx eas build:list --platform android --status finished
# Then download and install:
# curl -L -o /tmp/dispatch.apk <URL_FROM_EAS>
# adb install /tmp/dispatch.apk
```

### 6. Launch and Connect

1. Find **Dispatch** in your app drawer and open it
2. Complete the onboarding screens (3 swipes)
3. Tap **Connect Wallet** to authenticate via MWA
4. Set coordinator URL (default should work for testnet)
5. Tap the big gold **EARNING** button to go online
6. Your phone is now a compute node

---

## Troubleshooting

**"INSTALL_FAILED_UPDATE_INCOMPATIBLE"**
```bash
adb uninstall com.dispatch.seeker   # Remove old version first
adb install /path/to/dispatch.apk
```

**Device not detected**
- Try a different USB-C cable (some are charge-only)
- Run `adb kill-server && adb start-server`
- Check that USB Debugging is still enabled

**App crashes on launch**
- Check logs: `adb logcat | grep -i dispatch`
- Ensure a Solana wallet app is installed on the device

---

## For Demo Recording

When recording the Seeker demo for the hackathon video:

1. Install the app using steps above
2. Open the app, connect wallet
3. Go online (tap the gold button)
4. Have a second terminal ready to submit a test job:
   ```bash
   dispatch agent run --type summarize --prompt "Summarize the Solana whitepaper" --policy fast
   ```
5. Watch the job appear in the app's Job History section
6. Use `adb shell screenrecord /sdcard/dispatch-demo.mp4` to capture the screen, or mirror with `scrcpy`

### Screen Mirroring (for recording)
```bash
# Install scrcpy for wireless screen mirroring
brew install scrcpy

# Mirror the Seeker screen to your Mac
scrcpy --window-title "Dispatch on Seeker"
```
