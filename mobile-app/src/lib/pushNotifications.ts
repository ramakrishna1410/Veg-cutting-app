import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Requests notification permission, gets an Expo push token, and saves it
 * on the signed-in user's Firestore doc — the onOrderUpdated Cloud Function
 * reads it from there to send status/assignment pushes. Silently no-ops on
 * simulators/emulators and if permission is denied.
 */
export async function registerForPushNotifications(uid: string) {
  if (!Device.isDevice) return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== "granted") return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const { data: token } = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );

  await updateDoc(doc(db, "users", uid), { pushToken: token }).catch(() => {});
}
