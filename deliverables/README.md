# Android demo build

The locally generated APK is intentionally excluded from Git because release binaries should be shared as email attachments or GitHub Release assets rather than committed to source history.

Build a modern Android (arm64) demo APK with:

```bash
cd mobile/android
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Current local artifact: `TraceChain-v1.0-demo.apk`

SHA-256: `26b90c68a1557c596d3a0d7d7a70155512db658d3ae32455e313e9a50bf1191c`
