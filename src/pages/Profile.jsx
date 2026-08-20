import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Profile() {
    // Get the user ID from the URL parameter
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Load user data when component mounts or ID changes
    useEffect(() => {
        // First, try to get the user from sessionStorage (saved by Feed/Explore)
        const users = JSON.parse(sessionStorage.getItem("users") || "[]");
        const foundUser = users.find((u) => u.login.uuid === id);

        if (foundUser) {
            setUser(foundUser);
        } else {
            // Fallback: fetch a specific user using the ID as a seed
            const fetchUser = async () => {
                try {
                    const response = await fetch(
                        `https://randomuser.me/api/?seed=${id}`,
                    );
                    const data = await response.json();
                    setUser(data.results[0]);
                } catch (error) {
                    console.error("Error fetching user:", error);
                }
            };
            fetchUser();
        }
    }, [id]);

    // Loading state
    if (!user) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="min-h-screen">
            {/* Cover photo placeholder */}
            <div className="h-32 bg-gray-200"></div>

            {/* Profile header */}
            <div className="px-4">
                <div className="flex justify-between items-start">
                    <div className="-mt-12">
                        <img
                            src={user.picture.large}
                            alt={user.name.first}
                            className="w-24 h-24 rounded-full border-4 border-white object-cover"
                        />
                    </div>
                    <button className="bg-black text-white rounded-full px-4 py-2 font-bold mt-2">
                        Edit profile
                    </button>
                </div>

                {/* User info */}
                <div className="mt-3">
                    <h1 className="font-bold text-xl">
                        {user.name.first} {user.name.last}
                    </h1>
                    <p className="text-x-gray">@{user.login.username}</p>
                    <p className="mt-2">
                        📍 {user.location.city}, {user.location.country}
                    </p>
                    <p className="text-x-gray">📧 {user.email}</p>
                    <p className="text-x-gray">📱 {user.phone}</p>
                </div>

                {/* Follow counts (static) */}
                <div className="flex space-x-6 mt-3 text-sm">
                    <span>
                        <strong>128</strong>{" "}
                        <span className="text-x-gray">Following</span>
                    </span>
                    <span>
                        <strong>1.2k</strong>{" "}
                        <span className="text-x-gray">Followers</span>
                    </span>
                </div>
            </div>

            {/* Tabs (non-functional, just UI) */}
            <div className="border-b border-x-lightgray mt-4">
                <nav className="flex">
                    <button className="flex-1 py-3 font-bold border-b-2 border-black">
                        Posts
                    </button>
                    <button className="flex-1 py-3 text-x-gray">Replies</button>
                    <button className="flex-1 py-3 text-x-gray">Media</button>
                    <button className="flex-1 py-3 text-x-gray">Likes</button>
                </nav>
            </div>

            {/* Placeholder for posts */}
            <div className="p-4 text-center text-x-gray">
                No posts yet (this is where tweets from this user would appear)
            </div>
        </div>
    );
}

export default Profile;
