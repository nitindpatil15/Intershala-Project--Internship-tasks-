import React, { useState, useEffect } from "react";
import axios from "axios";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

const RazorpayPayment = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        console.error("User ID is not provided.");
        setLoading(false);
        return;
      }

      const userDocRef = doc(getFirestore(), "users", userId);

      try {
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          setUser(userSnapshot.data());
        } else {
          console.error("No user found with the given ID.");
        }
      } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const generateOtp = async () => {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    setOtp(generatedOtp);

    try {
      // Send OTP to user's email
      await axios.post("http://localhost:5000/api/otp/send-otp", {
        email: user?.email,
        otp: generatedOtp,
      });

      setOtpSent(true);
      alert("OTP has been sent to your email.");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Please try again.");
    }
  };

  const verifyOtp = () => {
    if (enteredOtp === otp.toString()) {
      setOtpVerified(true);
      alert("OTP Verified! You can now proceed to payment.");
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  const handlePayment = async () => {
    const API_URL = "http://localhost:5000/api/payment";

    try {
      const { data } = await axios.post(API_URL, { amount: 50 });

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "InternArea",
        description: "Prime Membership",
        order_id: data.orderId,
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(`${API_URL}/verify`, {
              ...response,
              uid: userId,
            });

            if (verifyResponse.data.success) {
              // Update Firestore user status to Prime
              const userDocRef = doc(getFirestore(), "users", userId);
              await setDoc(userDocRef, { status: "prime" }, { merge: true });

              alert("Payment Successful! User status updated to Prime.");
            } else {
              alert("Payment verification failed. Please try again.");
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            alert("An error occurred during verification.");
          }
        },
        prefill: {
          name: user?.name || "User Name",
          email: user?.email || "user@example.com",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("An error occurred while initiating payment.");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-600">
        Loading user information...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-red-500">
        User not found. Please log in to proceed with the payment.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200 h-32">
      {user.status === "prime" ? (
        <Link to='/resume-form' className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
          Build Resume
        </Link>
      ) : (
        <div className="text-center">
          {!otpVerified ? (
            <>
              {!otpSent ? (
                <button
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                  onClick={generateOtp}
                >
                  Generate OTP
                </button>
              ) : (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                    onClick={verifyOtp}
                  >
                    Verify OTP
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600"
              onClick={handlePayment}
            >
              Become Prime
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RazorpayPayment;
