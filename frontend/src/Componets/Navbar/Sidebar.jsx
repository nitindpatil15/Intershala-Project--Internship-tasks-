import React, { useEffect, useState } from "react";
import logo from "../../Assets/logo.png";
import "./sidebar.css";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";

function Sidebar({ userId }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        console.error("User ID is undefined");
        return;
      }

      try {
        const userDocRef = doc(getFirestore(), "users", userId);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          setUser(userSnapshot.data());
        } else {
          console.error("User not found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

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
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [sidebarOpen, userId]);

  const logoutFunction = () => {
    signOut(auth);
    navigate("/");
  };

  return (
    <>
      <div className="App2 -mt-2 overflow-hidden">
        <Link to="/">
          <img src={logo} alt="Logo" id="nav2-img" />
        </Link>
        <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <span className="cursor-pointer close-btn" onClick={closeSidebar}>
            &times;
          </span>
          {user ? (
            <>
              <div className="profile">
                <Link to={"/profile"}>
                  <img
                    className="rounded-full justify-center mx-auto w-24"
                    src={user.photo || "/default-avatar.png"} // Use a default image if photo is undefined
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
            </>
          ) : (
            <div className="auth"></div>
          )}
          <Link to="/internship">Internships</Link>
          <Link to="/Jobs">Jobs</Link>
          <Link to={"/"} className="small">
            Contact Us
          </Link>
          <hr />
          {user ? (
            <>
              <div className="addmore">
                <Link to={"/userapplication"}>
                  <p>My Applications</p>
                </Link>
                <Link to={"/resume"}>
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
            </>
          ) : (
            <div className="addmore">
              <p>Register- As a Student</p>
              <p >Register- As an Employer</p>
            </div>
          )}

          {!user ? (
            <>
              <div className="reg">
                <Link to="/register">
                  <button className="">Register</button>
                </Link>
              </div>
              <div className="">
                <Link to={"/adminLogin"}>
                  <button id="">Admin Login</button>
                </Link>
              </div>
            </>
          ) : null}
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
          <i className="bi bi-search"></i>
          <input type="search" placeholder="Search" />
        </div>

        <p className="text-red-300">Hire Talent</p>
      </div>
    </>
  );
}

export default Sidebar;
