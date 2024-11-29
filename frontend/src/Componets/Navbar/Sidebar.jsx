import React, { useCallback, useEffect, useState } from "react";
import logo from "../../Assets/logo.png";
import "./sidebar.css";
import { Link} from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { collection, doc, getDoc, onSnapshot, query } from "firebase/firestore";
import { useSelector } from "react-redux";
import { selectUser } from "../../Feature/Userslice";

function Sidebar() {
  const userId = useSelector(selectUser)
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);


  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  // Function to fetch user data
  const fetchUserData = useCallback(async () => {
    if (!userId?.uid) {
      console.error("User ID is undefined");
      return;
    }

    try {
      const userDocRef = doc(db, "users", userId?.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        setUser(userSnapshot.data());
      } else {
        console.error("User not found.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
    }
  }, [userId]);

  // Function to display browser notifications
  const showBrowserNotification = (message, status) => {
    if (Notification.permission === "granted") {
      const options = {
        body: message,
        background: status === "accepted" ? "green" : "red",
      };
      new Notification("Application Status Update", options);
    }
  };

  // Fetch notifications and handle sidebar behavior
  useEffect(() => {
    let unsubscribeNotifications = null;

    if (userId) {
      const notificationsRef = collection(db, "users", userId?.uid, "notifications");
      const q = query(notificationsRef);

      unsubscribeNotifications = onSnapshot(q, (snapshot) => {
        const newNotifications = snapshot.docs.map((doc) => doc.data());

        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            showBrowserNotification(
              change.doc.data().message,
              change.doc.data().status
            );
          }
        });

        setNotifications(newNotifications);
      });
    }

    fetchUserData();

    const handleOutsideClick = (e) => {
      if (
        sidebarOpen &&
        !e.target.closest(".sidebar") &&
        !e.target.closest(".open-btn")
      ) {
        closeSidebar();
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      if (unsubscribeNotifications) unsubscribeNotifications();
      document.removeEventListener("click", handleOutsideClick);
    };
    // eslint-disable-next-line
  }, [userId, sidebarOpen, fetchUserData]);

  const logoutFunction = () => {
    signOut(auth);
    setSidebarOpen(false)
    window.location.reload()
  };

  return (
    <div className="App2 -mt-2 overflow-hidden">
      <Link to="/">
        <img src={logo} alt="Logo" id="nav2-img" />
      </Link>

      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <span className="cursor-pointer close-btn" onClick={closeSidebar}>
          &times;
        </span>

        {user ? (
          <div className="profile">
            <Link to="/profile">
              <img
                className="rounded-full justify-center mx-auto w-24"
                src={user.photo || "/default-avatar.png"}
                alt="Profile"
              />
            </Link>
            <p className="text-center">
              Profile name{" "}
              <span className="font-bold text-blue-500">
                {user.displayName || "N/A"}
              </span>
            </p>
          </div>
        ) : null}

        <Link to="/internship">Internships</Link>
        <Link to="/Jobs">Jobs</Link>
        <Link to="/" className="small">
          Contact Us
        </Link>
        <hr />

        {user ? (
          <div className="addmore">
            <Link to="/userapplication">
              <p>My Applications</p>
            </Link>
            <Link to="/resume">
              <p>View Resume</p>
            </Link>
            <Link>
              <p>More</p>
            </Link>
            <button
              onClick={logoutFunction}
              className="px-4 py-1 w-full bg-black text-white"
            >
              Logout <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        ) : (
          <div className="addmore">
            <p>Register- As a Student</p>
            <p>Register- As an Employer</p>
          </div>
        )}

        {!user && (
          <>
            <div className="reg">
              <Link to="/register">
                <button>Register/Login</button>
              </Link>
            </div>
            <div>
              <Link to="/adminLogin">
                <button>Admin Login</button>
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="main">
        <span
          style={{ fontSize: "22px" }}
          className="open-btn"
          onClick={openSidebar}
        >
          &#9776;
        </span>
      </div>

      <div className="search2">
        <Link to="/notifications" className="bg-gray-400 p-1 rounded-lg mt-14">
          Alert{" "}
          {notifications.length > 0 && (
            <span className="text-base font-bold rounded-full bg-black px-1 text-red-600">
              {notifications.length}
            </span>
          )}
        </Link>
      </div>

      <p className="text-red-300">Hire Talent</p>
    </div>
  );
}

export default Sidebar;
