import React, { useEffect, useState } from "react";
import logo from "../../Assets/logo.png";
import { Link } from "react-router-dom";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../../firebase/firebase";
import { useSelector } from "react-redux";
import { selectUser } from "../../Feature/Userslice";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { collection, query, onSnapshot } from "firebase/firestore"; // Import Firestore

function Navbar() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [isDivVisibleForintern, setDivVisibleForintern] = useState(false);
  const [isDivVisibleForJob, setDivVisibleFroJob] = useState(false);
  const [isDivVisibleForlogin, setDivVisibleFrologin] = useState(false);
  const [isDivVisibleForProfile, setDivVisibleProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      });

      return () => unsubscribe(); // Cleanup listener when component unmounts
    }
  }, [userId, db]);

  const showBrowserNotification = (message, status) => {
    if (Notification.permission === "granted") {
      const options = {
        body: message,
        backgroundColor: status === "accepted" ? "green" : "red", // Example styling
      };

      new Notification("Application Status Update", options);
    }
  };

  const loginFunction = () => {
    signInWithPopup(auth, provider)
      .then(async (res) => {
        const userRef = doc(db, "users", res.user.uid);
        const userSnapshot = await userRef.get();
        console.log(userSnapshot.exists());

        if (userSnapshot.exists()) {
          console.log("User document found in Firestore.");
          navigate("/");
        } else {
          console.error("User document not found in Firestore. Login failed.");
          alert(
            "Your account is not registered. Please contact the administrator."
          );
          signOut(auth); // Log the user out if no document exists
        }
      })
      .catch((err) => {
        console.error("Error during sign-in:", err);
      });
    setDivVisibleFrologin(false);
  };

  const showLogin = () => {
    setDivVisibleFrologin(true);
  };
  const closeLogin = () => {
    setDivVisibleFrologin(false);
  };

  const showInternShips = () => {
    document.getElementById("ico").className = "bi bi-caret-up-fill";
    setDivVisibleForintern(true);
  };
  const hideInternShips = () => {
    document.getElementById("ico").className = "bi bi-caret-down-fill";
    setDivVisibleForintern(false);
  };
  const showJobs = () => {
    document.getElementById("ico2").className = "bi bi-caret-up-fill";
    setDivVisibleFroJob(true);
  };
  const hideJobs = () => {
    document.getElementById("ico2").className = "bi bi-caret-down-fill";
    setDivVisibleFroJob(false);
  };

  const logoutFunction = () => {
    signOut(auth);
    navigate("/");
  };

  return (
    <div>
      <nav className="bg-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div>
            <Link to="/">
              <img src={logo} alt="Logo" className="h-16" />
            </Link>
          </div>

          {/* Navbar links for large screens */}
          <div className="hidden md:flex space-x-6">
            <Link to="/Internship" className="text-black">
              <p onMouseEnter={showInternShips}>
                Internships <i id="ico" className="bi bi-caret-down-fill"></i>
              </p>
            </Link>
            <Link to="/Jobs" className="text-black">
              <p onMouseEnter={showJobs}>
                Jobs <i id="ico2" className="bi bi-caret-down-fill"></i>
              </p>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex items-center space-x-2">
            <i className="bi bi-search text-gray-600"></i>
            <input
              type="text"
              placeholder="Search"
              className="border px-2 py-1 rounded-md focus:outline-none"
            />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black"
            >
              <i
                className={`bi ${
                  isMobileMenuOpen ? "bi-x" : "bi-list"
                } text-2xl`}
              ></i>
            </button>
          </div>

          {/* Authentication Section for large screens */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/profile">
                  <img
                    src={user?.photo}
                    alt="User Profile"
                    onMouseEnter={() => setDivVisibleProfile(true)}
                    className="h-12 w-12 rounded-full mx-2"
                  />
                </Link>
                <Link
                  to="/resume"
                  className="text-black border-2 p-2 rounded-xl"
                >
                  Build Resume
                </Link>
              </div>
            ) : (
              <div className="flex space-x-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  onClick={showLogin}
                >
                  Login
                </button>
                <button className="border border-blue-500 text-blue-500 px-4 py-2 rounded-md">
                  <Link to="/register">Register</Link>
                </button>
              </div>
            )}
          </div>

          {/* User Actions for small screens */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md"
                onClick={logoutFunction}
              >
                Logout
              </button>
              <Link to="/notifications" className="text-black">
                Alert{" "}
                {notifications.length > 0 && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    {notifications.length}
                  </span>
                )}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Items */}
        {isMobileMenuOpen && (
          <div className="flex flex-col items-center space-y-4 md:hidden bg-white p-4">
            <Link to="/Internship" className="text-black">
              Internships
            </Link>
            <Link to="/Jobs" className="text-black">
              Jobs
            </Link>
            <div className="flex flex-col items-center space-y-2">
              {!user ? (
                <div className="flex space-x-4">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    onClick={showLogin}
                  >
                    Login
                  </button>
                  <button className="border border-blue-500 text-blue-500 px-4 py-2 rounded-md">
                    <Link to="/register">Register</Link>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                    onClick={logoutFunction}
                  >
                    Logout
                  </button>
                  <Link to="/profile" className="text-black">
                    Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Dropdowns for Internships and Jobs */}
      {isDivVisibleForintern && (
        <div className="absolute top-20 left-[15rem] bg-white shadow-lg p-4">
          <p onMouseLeave={hideInternShips}>
            Internships
            <i id="ico" className="bi bi-caret-up-fill"></i>
          </p>
        </div>
      )}

      {isDivVisibleForJob && (
        <div className="absolute top-20 left-[22rem] bg-white shadow-lg p-4">
          <p onMouseLeave={hideJobs}>
            Jobs
            <i id="ico2" className="bi bi-caret-up-fill"></i>
          </p>
        </div>
      )}
    </div>
  );
}

export default Navbar;
