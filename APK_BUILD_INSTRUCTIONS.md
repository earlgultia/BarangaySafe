# SafeBarangay APK Build Instructions

## Current Status
✅ React app built successfully  
✅ Capacitor initialized with Android platform  
⏳ Awaiting Java/Android SDK setup to build APK

## Prerequisites Required

### 1. Install Java Development Kit (JDK)
Download JDK 17 or later from:
- **Official**: https://www.oracle.com/java/technologies/downloads/
- **Alternative (OpenJDK)**: https://adoptium.net/

After installation, set JAVA_HOME:
```powershell
# Find your Java installation path (usually C:\Program Files\Java\jdk-17.x.x or similar)
# Then in PowerShell:
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-17.x.x", "User")
# Restart PowerShell/terminal after setting
```

Verify installation:
```powershell
java -version
javac -version
```

### 2. Install Android SDK
Download Android Studio from: https://developer.android.com/studio

During installation:
- Install Android SDK
- Install SDK Build-Tools (version 34 or later)
- Install Android Emulator (optional, for testing)

Set ANDROID_HOME:
```powershell
# Typically installed at C:\Users\<YourUsername>\AppData\Local\Android\Sdk
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\BISUR\AppData\Local\Android\Sdk", "User")
# Also add to PATH:
[Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";C:\Users\BISUR\AppData\Local\Android\Sdk\tools;C:\Users\BISUR\AppData\Local\Android\Sdk\platform-tools", "User")
# Restart PowerShell after setting
```

Verify installation:
```powershell
sdkmanager --list
```

### 3. Build the APK
Once Java and Android SDK are installed, run:

```powershell
cd C:\Users\BISUR\SafeBarangay\android
.\gradlew assembleRelease
```

This will generate the APK at:
```
C:\Users\BISUR\SafeBarangay\android\app\build\outputs\apk\release\app-release-unsigned.apk
```

### 4. Sign the APK (for distribution)
To release the APK on Google Play, you need to sign it:

```powershell
# Generate a keystore (one-time)
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias

# Sign the APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks app-release-unsigned.apk my-key-alias
```

Then optimize it:
```powershell
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

## File Locations
- **Source code**: `C:\Users\BISUR\SafeBarangay\src\`
- **Built web assets**: `C:\Users\BISUR\SafeBarangay\dist\`
- **Android project**: `C:\Users\BISUR\SafeBarangay\android\`
- **Capacitor config**: `C:\Users\BISUR\SafeBarangay\capacitor.config.ts`

## Troubleshooting

### Gradle sync fails
- Clear gradle cache: `.\gradlew clean`
- Invalidate Android Studio cache: File → Invalidate Caches

### Build timeout
- Increase gradle heap: `gradle.properties` → `org.gradle.jvmargs=-Xmx2048m`

### APK installation fails
- Ensure device has USB debugging enabled
- Check minimum API level (currently targeting API 26+)

## Next Steps
1. Install JDK and Android SDK as described above
2. Run the build command
3. Test on Android device or emulator
4. Sign and align APK for production release
