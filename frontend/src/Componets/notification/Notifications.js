import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth"; // Import Firebase Authentication
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
} from "firebase/firestore"; // Import Firestore
import { app } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate()
  const db = getFirestore(app); // Get Firestore instance
  const auth = getAuth(app); // Get Auth instance
  const [notifications, setNotifications] = useState([]);
  const userId = auth.currentUser?.uid; // Access the current user ID safely

  useEffect(() => {
    if (userId) {
      const notificationsRef = collection(db, "users", userId, "notifications");
      const q = query(notificationsRef);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newNotifications = [];
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            newNotifications.push(change.doc.data());
            showBrowserNotification(
              change.doc.data().message,
              change.doc.data().status
            );
          }
        });
        setNotifications(newNotifications);
        console.log('unsubscribe: ',unsubscribe)
        console.log(newNotifications);
      });

      return () => unsubscribe(); // Cleanup listener when component unmounts
    }
  }, [userId, db]);

  const showBrowserNotification = (message, status) => {
    console.log("Attempting to show notification:", message, status);
    if (Notification.permission === "granted") {
      const options = {
        body: message,
        backgroundColor: status === "accepted" ? "green" : "red", // Example styling
      };

      new Notification("Application Status Update", options);
      console.log(options)
    }
  };

  return (
    <div>
      <h3 className="text-center text-2xl py-2">Your Notifications</h3>
      <ul className="flex flex-col">
        {notifications.map((notif, index) => (
          <div key={index}>
            <div
            onClick={()=>{navigate('/userapplication')}}
              className="notification my-2"
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
