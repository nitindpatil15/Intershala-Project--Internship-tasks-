import React, { useEffect, useState } from "react";
import logo from "../../Assets/logo.png";
import { Link } from "react-router-dom";
import "./navbar.css";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../../firebase/firebase";
import { useSelector } from "react-redux";
import { selectUser } from "../../Feature/Userslice";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line 
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";

function Navbar() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [isDivVisibleForintern, setDivVisibleForintern] = useState(false);
  const [isDivVisibleForJob, setDivVisibleForJob] = useState(false);
  const [isDivVisibleForlogin, setDivVisibleForlogin] = useState(false);
  // eslint-disable-next-line 
  const [isDivVisibleForProfile, setDivVisibleForProfile] = useState(false);
  const [isStudent, setStudent] = useState(true);
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
            newNotifications.push(change.doc.data());
            showBrowserNotification(
              change.doc.data().message,
              change.doc.data().status
            );
          }
        });
        setNotifications(newNotifications);
      });

      return () => unsubscribe();
    }
  }, [userId]);

  const showBrowserNotification = (message, status) => {
    if (Notification.permission === "granted") {
      const options = {
        body: message,
        backgroundColor: status === "accepted" ? "green" : "red",
      };
      new Notification("Application Status Update", options);
    }
  };

  const loginFunction = () => {
    signInWithPopup(auth, provider)
      .then(async (res) => {
        const userRef = doc(db, "users", res.user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          navigate("/");
        } else {
          alert(
            "Your account is not registered. Please contact the administrator."
          );
          signOut(auth);
        }
      })
      .catch((err) => console.error("Error during sign-in:", err));
    setDivVisibleForlogin(false);
  };

  const showLogin = () => setDivVisibleForlogin(true);
  const closeLogin = () => setDivVisibleForlogin(false);
  const setTrueForStudent = () => setStudent(false);
  const setFalseForStudent = () => setStudent(true);

  const logoutFunction = () => {
    signOut(auth);
    navigate("/");
  };

  const showDropdown = (setDivVisible) => setDivVisible(true);
  const hideDropdown = (setDivVisible) => setDivVisible(false);

  return (
    <div>
      <nav className="nav1 py-1">
        <ul>
          <div className="img">
            <Link to={"/"}>
              <img src={logo} alt="Logo" />
            </Link>
          </div>
          <div className="elem flex items-center">
            <Link to="/internship" className="mx-2"
              id="int"
              onMouseEnter={() => showDropdown(setDivVisibleForintern)}
              onMouseLeave={() => hideDropdown(setDivVisibleForintern)}
            >
              Internships <i id="ico" className="bi bi-caret-down-fill"></i>
            </Link>
            <Link to="/Jobs"
              onMouseEnter={() => showDropdown(setDivVisibleForJob)}
              onMouseLeave={() => hideDropdown(setDivVisibleForJob)}
            >
              Jobs <i id="ico2" className="bi bi-caret-down-fill"></i>
            </Link>
          </div>
          <div className="search ml-20">
            <i className="bi bi-search"></i>
            <input type="text" placeholder="Search" />
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center">
                <div className="Profile mx-20 flex items-center">
                  <Link to={"/profile"}>
                    <img
                      src={user?.photo}
                      alt="Profile"
                      onMouseEnter={() => showDropdown(setDivVisibleForProfile)}
                      className="rounded-full w-12 ml-3"
                      id="picpro"
                    />
                  </Link>
                  <Link to={"/resume"} className="bg-black text-white p-2 rounded-xl">Resume</Link>
                </div>
                <button
                  className="bt-log mx-5"
                  id="bt"
                  onClick={logoutFunction}
                >
                  Logout
                </button>
                <Link
                  to="/notifications"
                  className="bg-gray-400 p-2 rounded-lg"
                >
                  Alert{" "}
                  {notifications.length > 0 && (
                    <span className="text-xl font-bold rounded-full bg-black px-2 text-red-600">
                      {notifications.length}
                    </span>
                  )}
                </Link>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="auth">
                  <button className="btn1" onClick={showLogin}>
                    Login
                  </button>
                  <button className="btn2">
                    <Link to="/register">Register</Link>
                  </button>
                  <button className="btn2">
                    <Link to="/adminLogin">Admin</Link>
                  </button>
                </div>
                  <h1 className="text-green-700">Hire Talent</h1>
              </div>
            )}
          </div>
        </ul>
      </nav>

      {isDivVisibleForintern && (
        <div className="profile-dropdown-2">
          <div className="left-section">
            <p>Top Locations</p>
            <p>Profile</p>
            <p>Top Category</p>
            <p>Explore More Internships</p>
          </div>
          <div className="line flex bg-slate-400"></div>
          <div className="right-section">
            <p>Intern at India</p>
            <p>Intern at India</p>
          </div>
        </div>
      )}

      {isDivVisibleForJob && (
        <div className="profile-dropdown-1">
          <div className="left-section">
            <p>Top Locations</p>
            <p>Profile</p>
            <p>Top Category</p>
          </div>
          <div className="line flex bg-slate-400"></div>
          <div className="right-section">
            <p>Job in India</p>
            <p>Job in India</p>
          </div>
        </div>
      )}

      {isDivVisibleForlogin && (
        <div className="login">
          <button id="cross" onClick={closeLogin}>
            <i className="bi bi-x"></i>
          </button>
          <h5 id="state" className="mb-4 justify-center text-center">
            <span
              id="Sign-in"
              className={`auth-tab ${isStudent ? "active" : ""}`}
              onClick={setFalseForStudent}
            >
              Student
            </span>
            <span
              id="join-in"
              className={`auth-tab ${!isStudent ? "active" : ""}`}
              onClick={setTrueForStudent}
            >
              Employee and T&P
            </span>
          </h5>
          {isStudent ? (
            <div className="py-6">
              <p
                onClick={loginFunction}
                className="flex items-center justify-center mt-4 bg-slate-500 text-white rounded-lg hover:bg-gray-400"
              >
                Sign in with Google
              </p>
            </div>
          ) : (
            <div className="py-6">
              <p className="flex items-center justify-center mt-4 bg-slate-100 text-gray-500 rounded-lg hover:bg-gray-100">
                Sign in with Google
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Navbar;
