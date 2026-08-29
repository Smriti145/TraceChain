# Android demo build

The locally generated APK is intentionally excluded from Git because release binaries should be shared as email attachments or GitHub Release assets rather than committed to source history.

Build a modern Android (arm64) demo APK with:

```bash
cd mobile/android
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Current local artifact: `TraceChain-v1.0-demo.apk`

SHA-256: `652aa78459d88200fcb69b4687b276160f7dff2dc5af07095259106b3c30a16a`
