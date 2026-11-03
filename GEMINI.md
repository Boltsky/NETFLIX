# Antigravity Workspace Rules - NETFLIX / CINEWAVE TV

## 1. Large Image & Screenshot Handling (CRITICAL API LIMIT RULE)
The Google CloudCode / Gemini API has a strict 1 MB (1,000,000 bytes) limit per image payload, and requires completely valid, uncorrupted PNG/JPEG image binaries.
- NEVER call 
ead_file or iew_file on uncompressed full-resolution screenshots or images exceeding 1 MB. Doing so causes the API to immediately fail with INVALID_ARGUMENT (code 400): Request contains an invalid argument. reason: INVALID_MEDIA, error_number: 2011.
- If taking emulator screenshots, verify the file contains an intact IEND footer and compress or resize it before viewing.
- Prefer inspecting UI state via db shell uiautomator dump or logcat instead of reading raw 1080p/900p PNGs.

## 2. ADB Screencap / Screenshots on Windows
NEVER use stdout redirection ('>') or 'exec-out' for capturing screenshots on Windows:
- DO NOT RUN: adb exec-out screencap -p > file.png
- DO NOT RUN: cmd /c "adb ... > file.png"

ALWAYS use device-local capture followed by 'adb pull':
`powershell
& "C:\Program Files\BlueStacks_nxt\HD-Adb.exe" -s emulator-5554 shell screencap -p /sdcard/screen.png
& "C:\Program Files\BlueStacks_nxt\HD-Adb.exe" -s emulator-5554 pull /sdcard/screen.png local_screen.png
`
