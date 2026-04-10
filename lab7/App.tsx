import { MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const ALBUM_NAME = "Camera-Flutter";

function SnackBarOverlay({
  message,
  backgroundColor,
  onDismiss,
}: {
  message: string;
  backgroundColor: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  return (
    <View style={[styles.snackbar, { backgroundColor }]} pointerEvents="none">
      <Text style={styles.snackbarText}>{message}</Text>
    </View>
  );
}

export default function MyApp() {
  return (
    <View style={styles.appRoot}>
      <StatusBar style="light" />
      <CameraScreen />
    </View>
  );
}

function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  // Не вызываем getCameraPermissionsAsync при монтировании: на части устройств это даёт
  // необработанный reject и в Expo Go показывается общий экран «Something went wrong».
  const [, requestPermission] = useCameraPermissions({ get: false });
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [snack, setSnack] = useState<{
    msg: string;
    color: string;
  } | null>(null);

  const showSnack = useCallback((msg: string, color: string) => {
    setSnack({ msg, color });
  }, []);

  const dismissSnack = useCallback(() => setSnack(null), []);

  const startCamera = async () => {
    if (isCameraStarting) return;
    setIsCameraStarting(true);

    try {
      const response = await requestPermission();
      if (!response?.granted) {
        showSnack(
          `Ошибка запуска камеры: ${response == null ? "нет ответа" : "нет разрешения"}`,
          "#d32f2f",
        );
        return;
      }
      setIsCameraInitialized(true);
    } catch (e) {
      showSnack(`Ошибка запуска камеры: ${String(e)}`, "#d32f2f");
    } finally {
      setIsCameraStarting(false);
    }
  };

  const takePhoto = async () => {
    if (!isCameraInitialized) return;
    const cam = cameraRef.current;
    if (cam == null) return;

    let uri: string;
    try {
      const photo = await cam.takePictureAsync({ quality: 1 });
      if (photo?.uri == null || photo.uri === "") {
        showSnack("Ошибка съёмки", "#d32f2f");
        return;
      }
      uri = photo.uri;
    } catch {
      showSnack("Ошибка съёмки", "#d32f2f");
      return;
    }

    try {
      const mediaPerm = await MediaLibrary.requestPermissionsAsync();
      if (!mediaPerm.granted) {
        showSnack("Ошибка сохранения фото", "#d32f2f");
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      const existing = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
      if (existing) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], existing, false);
      } else {
        await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset, false);
      }

      showSnack("Фото сохранено в галерею", "#388e3c");
    } catch {
      showSnack("Ошибка сохранения фото", "#d32f2f");
    }
  };

  return (
    <View style={styles.root}>
      {!isCameraInitialized ? (
        <View style={styles.previewPlaceholder}>
          <Text style={styles.placeholderText}>
            Камера выключена{"\n"}Нажмите кнопку ниже
          </Text>
        </View>
      ) : (
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      )}

      <View style={styles.bottomBar}>
        {!isCameraInitialized ? (
          <Pressable
            onPress={startCamera}
            disabled={isCameraStarting}
            style={({ pressed }) => [
              styles.enableButton,
              pressed && styles.buttonPressed,
              isCameraStarting && styles.buttonDisabled,
            ]}
          >
            <MaterialIcons name="videocam" size={24} color="#000" />
            <Text style={styles.enableButtonLabel}>
              {isCameraStarting ? "Запуск..." : "Включить камеру"}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={takePhoto}
            style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          >
            <MaterialIcons name="photo-camera" size={50} color="#000" />
          </Pressable>
        )}
      </View>

      {snack != null && (
        <SnackBarOverlay
          message={snack.msg}
          backgroundColor={snack.color}
          onDismiss={dismissSnack}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    backgroundColor: "#000",
  },
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  previewPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 24,
    textAlign: "center",
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomBar: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  enableButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 4,
  },
  enableButtonLabel: {
    marginLeft: 8,
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  fab: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  fabPressed: {
    opacity: 0.9,
  },
  snackbar: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  snackbarText: {
    color: "#fff",
    fontSize: 16,
  },
});
