import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../Feature/Userslice";

function Notifications() {
    const user = useSelector(selectUser);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user?.uid) return; // Only fetch if the user ID exists
            
            try {
                const response = await axios.get(`http://localhost:5000/api/notifications/${user.uid}`);
                console.log(response.data)
                setNotifications(response.data);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };
        
        fetchNotifications();
    }, [user?.uid]); // Re-run if user.uid changes

    return (
        <div className="h-screen">
            <h1 className="uppercase text-center text-2xl p-10">Notifications</h1>
            {notifications.length > 0 ? (
                notifications.map((notification) => (
                    <div
                        key={notification._id}
                        className={`notification flex justify-between px-4 py-2 rounded-lg my-2 ${
                            notification.application?.status === "accepted" ? "bg-green-600" : 
                            notification.application?.status === "rejected" ? "bg-red-600" : 
                            "bg-gray-100"
                        }`}
                    >
                        <p>{notification?.message} for {notification.application?.company} in {notification.application?.category}</p>
                        <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500">No notifications available</p>
            )}
        </div>
    );
}

export default Notifications;
