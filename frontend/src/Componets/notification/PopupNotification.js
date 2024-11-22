import { useEffect } from "react";
import { getAuth } from "firebase/auth"; // Firebase Authentication
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
} from "firebase/firestore"; // Firestore
import { app } from "../../firebase/firebase"; // Firebase app instance

const PopupNotifications = () => {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    // Listen for updates only if a user is logged in
    if (userId) {
      const notificationsRef = collection(db, "users", userId, "notifications");
      const q = query(notificationsRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const notification = change.doc.data();

            // Trigger browser's built-in notification
            showBrowserNotification(notification.message, notification.status);
          }
        });
      });

      return () => unsubscribe(); // Cleanup listener on component unmount
    }
  }, [userId, db]);

  const showBrowserNotification = (message, status) => {
    // Check if permission is granted before showing notification
    if (Notification.permission === "granted") {
      const options = {
        body: message,
        status
      };

      new Notification("Application Status Update", options);
    } else {
      console.warn("Notification permission not granted.");
    }
  };

  return null; // This component does not render anything
};

export default PopupNotifications;
