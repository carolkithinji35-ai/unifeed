import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Explore() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(
                    "https://randomuser.me/api/?results=20",
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

    // Filter users based on search term
    const filteredUsers = users.filter((user) => {
        const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
        const username = user.login.username.toLowerCase();
        const location =
            `${user.location.city} ${user.location.country}`.toLowerCase();
        const query = searchTerm.toLowerCase();
        return (
            fullName.includes(query) ||
            username.includes(query) ||
            location.includes(query)
        );
    });

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 bg-white/80 backdrop-blur border-b border-x-lightgray p-4 z-10">
                <h1 className="font-bold text-xl">Explore</h1>
            </div>

            {/* Search bar */}
            <div className="p-4 border-b border-x-lightgray">
                <input
                    type="text"
                    placeholder="Search by name, username, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-x-bg rounded-full px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-x-blue"
                />
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-2 border-x-blue border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-x-gray">Loading...</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-x-gray">
                    No users found matching "{searchTerm}"
                </div>
            ) : (
                <div className="divide-y divide-x-lightgray">
                    {filteredUsers.map((user) => (
                        <Link
                            key={user.login.uuid}
                            to={`/profile/${user.login.uuid}`}
                            className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors"
                        >
                            <img
                                src={user.picture.thumbnail}
                                alt={user.name.first}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <p className="font-bold">
                                    {user.name.first} {user.name.last}
                                </p>
                                <p className="text-x-gray">
                                    @{user.login.username}
                                </p>
                                <p className="text-sm text-x-gray mt-1">
                                    📍 {user.location.city},{" "}
                                    {user.location.country}
                                </p>
                            </div>
                            <button className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-bold">
                                View
                            </button>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Explore;
