import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { app } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [notifications, setNotifications] = useState([]);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (userId) {
      const notificationsRef = collection(db, "users", userId, "notifications");
      const q = query(notificationsRef);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newNotifications = [];
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            newNotifications.push({ id: change.doc.id, ...change.doc.data() });
            showBrowserNotification(
              change.doc.data().message,
              change.doc.data().status
            );
          }
        });
        setNotifications((prev) => [...prev, ...newNotifications]);
      });

      return () => unsubscribe();
    }
  }, [userId, db]);

  const showBrowserNotification = (message, status) => {
    if (Notification.permission === "granted") {
      const options = {
        body: message,
        icon: "/favicon.ico", // Add an icon if required
      };
      new Notification("Application Status Update", options);
    }
  };

  const handleNotificationClick = async (notifId) => {
    // Navigate to user application page
    navigate("/userapplication");

    // Delete the notification from Firestore
    if (userId) {
      const notifRef = doc(db, "users", userId, "notifications", notifId);
      try {
        await deleteDoc(notifRef);
        // Remove the notification from the state
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notifId)
        );
      } catch (error) {
        console.error("Error deleting notification:", error.message);
      }
    }
  };

  return (
    <div>
      <h3 className="text-center text-2xl py-2">Your Notifications</h3>
      <ul className="flex flex-col">
        {notifications.map((notif) => (
          <div key={notif.id}>
            <div
              onClick={() => handleNotificationClick(notif.id)}
              className="notification my-2 cursor-pointer"
              style={{
                backgroundColor:
                  notif.status === "accepted"
                    ? "green"
                    : notif.status === "rejected"
                    ? "blue"
                    : "transparent",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              {notif.message} - {notif.status}
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
