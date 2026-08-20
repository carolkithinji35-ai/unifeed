import { useState, useEffect } from "react";
import TweetCard from "../components/TweetCard";

function Feed() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    "https://randomuser.me/api/?results=10",
                );
                const data = await response.json();
                setUsers(data.results);
                sessionStorage.setItem("users", JSON.stringify(data.results));
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) => {
        const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
        const username = user.login.username.toLowerCase();
        const query = searchTerm.toLowerCase();
        return fullName.includes(query) || username.includes(query);
    });

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 bg-white/80 backdrop-blur border-b border-x-lightgray p-4 z-10">
                <h1 className="font-bold text-xl">Home</h1>
            </div>

            <div className="p-4 border-b border-x-lightgray">
                <input
                    type="text"
                    placeholder="Search by name or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-x-bg rounded-full px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-x-blue"
                />
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-2 border-x-blue border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-x-gray">Loading posts...</p>
                </div>
            ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                    <TweetCard key={user.login.uuid} user={user} />
                ))
            ) : (
                <div className="text-center py-12 text-x-gray">
                    No users found matching "{searchTerm}"
                </div>
            )}
        </div>
    );
}

export default Feed;
