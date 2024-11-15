import React, { useState } from "react";
import logo from "../../Assets/logo.png";
import { Link } from "react-router-dom";
import "./navbar.css";
import Sidebar from "./Sidebar";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../../firebase/firebase";
import { useSelector } from "react-redux";
import { selectUser } from "../../Feature/Userslice";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase"; // Ensure Firestore is properly initialized

function Navbar() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [isDivVisibleForintern, setDivVisibleForintern] = useState(false);
  const [isDivVisibleForJob, setDivVisibleFroJob] = useState(false);
  const [isDivVisibleForlogin, setDivVisibleFrologin] = useState(false);
  const [isDivVisibleForProfile, setDivVisibleProfile] = useState(false);
  const [isStudent, setStudent] = useState(true);

  const loginFunction = () => {
    signInWithPopup(auth, provider)
      .then((res) => {
        // Store user information in Firestore
        const userRef = doc(db, "users", res.user.uid);
        setDoc(userRef, {
          uid: res.user.uid,
          displayName: res.user.displayName,
          email: res.user.email,
          photo: res.user.photoURL,
          providerId: res.user.providerData[0]?.providerId,
        })
          .then(() => {
            console.log("User stored in Firestore");
          })
          .catch((error) => {
            console.error("Error storing user in Firestore: ", error);
          });
      })
      .catch((err) => {
        console.log(err);
      });
    setDivVisibleFrologin(false);
  };

  const showLogin = () => {
    setDivVisibleFrologin(true);
  };
  const closeLogin = () => {
    setDivVisibleFrologin(false);
  };
  const setTrueForStudent = () => {
    setStudent(false);
  };
  const setFalseForStudent = () => {
    setStudent(true);
  };

  //  for showing profile dropdown
  const showtheProfile = () => {
    setDivVisibleProfile(true);
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
      <nav className="nav1">
        <ul>
          <div className="img">
            <Link to={"/"}>
              <img src={logo} alt="" srcSet="" />
            </Link>
          </div>
          <div className="elem">
            <Link to={"/Internship"}>
              <p id="int" className="" onMouseEnter={showInternShips}>
                {" "}
                Internships{" "}
                <i
                  onClick={hideInternShips}
                  id="ico"
                  className="bi bi-caret-down-fill"
                ></i>
              </p>
            </Link>
            <Link to={"/Jobs"}>
              <p onMouseEnter={showJobs}>
                Jobs{" "}
                <i
                  className="bi bi-caret-down-fill"
                  id="ico2"
                  onClick={hideJobs}
                ></i>
              </p>
            </Link>
          </div>
          <div className="search">
            <i className="bi bi-search"></i>
            <input type="text" placeholder="Search" />
          </div>
          <div className="flex items-center">
            {user ? (
              <>
                <div className="Profile mx-14">
                  <Link to={"/profile"}>
                    <img
                      src={user?.photo}
                      alt=""
                      onMouseEnter={showtheProfile}
                      className="rounded-full w-12 ml-3"
                      id="picpro"
                    />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="auth">
                  <button className="btn1" onClick={showLogin}>
                    Login
                  </button>

                  <button className="btn2">
                    <Link to="/register">Register</Link>
                  </button>
                </div>
              </>
            )}
          </div>
          {user ? (
            <div className="items-center">
              <button className="bt-log mx-4" id="bt" onClick={logoutFunction}>
                Logout 
              </button>
              <Link to="/notifications" className="bg-gray-400 p-2 rounded-lg">Alert</Link>
            </div>
          ) : (
            <>
              <div className="flex mt-7 hire">Hire Talent</div>

              <div className="admin">
                <Link to={"/adminLogin"}>
                  <button>Admin</button>{" "}
                </Link>
              </div>
            </>
          )}
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
            <p>Intern at India</p>
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
            <p>Explore More Internships</p>
          </div>
          <div className="line flex bg-slate-400"></div>
          <div className="right-section">
            <p>Intern at India</p>
            <p>Intern at India</p>
            <p>Intern at India</p>
            <p>Intern at India</p>
            <p>Intern at India</p>
          </div>
        </div>
      )}
      <div className="login">
        {isDivVisibleForlogin && (
          <>
            <button id="cross" onClick={closeLogin}>
              <i className="bi bi-x"></i>
            </button>
            <h5 id="state" className="mb-4 justify-center text-center">
              <span
                id="Sign-in"
                style={{ cursor: "pointer" }}
                className={`auth-tab ${isStudent ? "active" : ""}`}
                onClick={setFalseForStudent}
              >
                Student
              </span>
              &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
              <span
                id="join-in"
                style={{ cursor: "pointer" }}
                className={`auth-tab ${isStudent ? "active" : ""}`}
                onClick={setTrueForStudent}
              >
                Employee andT&P
              </span>
            </h5>
            {isStudent ? (
              <>
                <div className="py-6">
                  <div className="flex bg-white rounded-lg justify-center overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
                    <div className="w-full p-8 lg:w-1/2">
                      <p
                        onClick={loginFunction}
                        className="flex
 items-center h-9 justify-center mt-4 text-white bg-slate-500 rounded-lg hover:bg-gray-400"
                      >
                        <div className="px-4 py-3 ">
                          <span className="ml-2 mt-[-2rem] text-lg cursor-pointer">
                            Sign in with Google
                          </span>
                        </div>
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="py-6">
                  <div className="flex bg-white rounded-lg justify-center overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
                    <div className="w-full p-8 lg:w-1/2">
                      <p
                        className="flex
                        items-center h-9 justify-center mt-4 text-white bg-slate-100 rounded-lg hover:bg-gray-100"
                      >
                        {" "}
                        <svg className="h-6 w-6" viewBox="0 0 40 40">
                          <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 10 20 10C22.8042 10 25.3625 11.5842 27.1092 13.7358L27.2782 13.4025L28.9742 13.3808L28.9792 13.3658L28.9742 13.3808H36.3425C37.5375 15.7892 36.3425 16.7358 35.2192 17.1092Z" />
                        </svg>
                        <span className="ml-2 text-lg">
                          Sign in with Google
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
