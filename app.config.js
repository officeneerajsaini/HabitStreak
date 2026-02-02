export default {
  expo: {
    name: "habitStreak",
    slug: "habitStreak",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "habitstreak",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.neeraj.habittracker"
    },
    android: {
      package: "com.officeneerajsaini.habitstreak",
      minSdkVersion: 23,  // Android 6.0+ (covers ~98% of devices)
      compileSdkVersion: 34,
      targetSdkVersion: 34,
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/icon.png",
        backgroundImage: "./assets/images/icon.png",
        monochromeImage: "./assets/images/icon.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },    
    web: {
      output: "static",
      favicon: "./assets/images/icon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    // 🔥 NEW: Add environment variables here
    extra: {
      supabaseUrl: "https://upmstbqemylztyiezdrx.supabase.co",
      supabaseAnonKey:"sb_publishable_hUMzeI0_IMzkGJGdDC30hA_EHG3d-7R",
      eas: {
        projectId: "89543181-4920-4e18-91cb-091b1d693882",
      },
    }
  },
};