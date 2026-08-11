import { ConfigContext, ExpoConfig } from "expo/config";

type AppEnv = "development" | "staging" | "production";

const APP_ENV = (process.env.APP_ENV ?? "development") as AppEnv;

// Single source of truth for version
const APP_VERSION = "1.4.1";

// Single source of truth for Google Maps API key (falls back to env var if set)
const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_API_KEY ?? "AIzaSyCgiZW-tMOXOHS18Yv-50LN-wqfE8R2HSE";

const envConfig: Record<
  AppEnv,
  { name: string; bundleId: string; androidPackage: string }
> = {
  development: {
    name: "BW Akses+ (Dev)",
    bundleId: "id.co.bankwonosobo.bwaksesplus.dev",
    androidPackage: "id.co.bankwonosobo.bwaksesplus.dev",
  },
  staging: {
    name: "BW Akses+ (Staging)",
    bundleId: "id.co.bankwonosobo.bwaksesplus.staging",
    androidPackage: "id.co.bankwonosobo.bwaksesplus.staging",
  },
  production: {
    name: "BW Akses+",
    bundleId: "id.co.bankwonosobo.bwaksesplus",
    androidPackage: "id.co.bankwonosobo.bwaksesplus",
  },
};

const { name, bundleId, androidPackage } = envConfig[APP_ENV];

export default (_ctx: ConfigContext): ExpoConfig => ({
  name,
  slug: "bw-akses-plus",
  version: APP_VERSION,
  orientation: "portrait",
  icon: "./assets/icons/adaptive-icon.png",
  scheme: "platform",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    icon: {
      light: "./assets/icons/ios-light.png",
    },
    bundleIdentifier: bundleId,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    config: {
      googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#030213",
      foregroundImage: "./assets/icons/adaptive-icon.png",
      backgroundImage: "./assets/icons/adaptive-icon.png",
      monochromeImage: "./assets/icons/adaptive-icon.png",
    },
    config: {
      googleMaps: {
        apiKey: GOOGLE_MAPS_API_KEY,
      },
    },
    predictiveBackGestureEnabled: false,
    permissions: [
      // "android.permission.CAMERA",
      // "android.permission.RECORD_AUDIO",
      // "android.permission.ACCESS_COARSE_LOCATION",
      // "android.permission.ACCESS_FINE_LOCATION",
    ],
    package: androidPackage,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    // "@config-plugins/react-native-blob-util",
    [
      "expo-splash-screen",
      {
        image: "./assets/icons/splash-icon-light.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#3F9AAE",
        dark: {
          backgroundColor: "#3F9AAE",
        },
      },
    ],
    [
      "expo-camera",
      {
        cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone",
        recordAudioAndroid: true,
        barcodeScannerEnabled: true,
      },
    ],
    // [
    //   "expo-camera",
    //   {
    //     cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
    //     microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone",
    //     recordAudioAndroid: true,
    //   },
    // ],
    // [
    //   "expo-location",
    //   {
    //     locationAlwaysAndWhenInUsePermission:
    //       "Allow $(PRODUCT_NAME) to use your location.",
    //   },
    // ],
    // [
    //   "expo-navigation-bar",
    //   {
    //     enforceContrast: true,
    //     barStyle: "dark-content",
    //     visibility: "visible",
    //   },
    // ],
    [
      "expo-font",
      {
        fonts: [
          "node_modules/@expo-google-fonts/poppins/900Black/Poppins_900Black.ttf",
        ],
      },
    ],
    [
      "expo-secure-store",
      {
        configureAndroidBackup: true,
        faceIDPermission:
          "Allow $(PRODUCT_NAME) to access your Face ID biometric data.",
      },
    ],
    [
      "react-native-maps",
      {
        androidGoogleMapsApiKey: GOOGLE_MAPS_API_KEY,
        iosGoogleMapsApiKey: GOOGLE_MAPS_API_KEY,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    appEnv: APP_ENV,
    appVersion: APP_VERSION,
    router: {},
    eas: {
      projectId: "cf8ff3df-b5d8-48c4-a90a-1e2d4e5b82e2",
    },
    "expo-navigation-bar": {
      enforceContrast: true,
      barStyle: "dark-content",
      visibility: "visible",
    },
  },
  owner: "itbawon",
  updates: {
    url: "https://u.expo.dev/cf8ff3df-b5d8-48c4-a90a-1e2d4e5b82e2",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
});
