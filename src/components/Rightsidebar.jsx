import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function RightSidebar() {
    // State to hold suggested users fetched from the API
    const [suggestions, setSuggestions] = useState([]);

    // Fetch suggestions once when the component mounts
    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const response = await fetch(
                    "https://randomuser.me/api/?results=5",
                );
                const data = await response.json();
                setSuggestions(data.results);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            }
        };
        fetchSuggestions();
    }, []);

    return (
        <aside className="w-80 shrink-0 p-4 hidden lg:block">
            {/* "Who to follow" card */}
            <div className="bg-white rounded-2xl p-4 mb-4">
                <h2 className="font-bold text-xl mb-4">Who to follow</h2>
                {suggestions.map((user) => (
                    <Link
                        key={user.login.uuid}
                        to={`/profile/${user.login.uuid}`}
                        className="flex items-center space-x-3 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <img
                            src={user.picture.thumbnail}
                            alt={user.name.first}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">
                                {user.name.first} {user.name.last}
                            </p>
                            <p className="text-sm text-x-gray truncate">
                                @{user.login.username}
                            </p>
                        </div>
                        <button className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-bold">
                            Follow
                        </button>
                    </Link>
                ))}
            </div>

            {/* Trending card (static content) */}
            <div className="bg-white rounded-2xl p-4">
                <h2 className="font-bold text-xl mb-4">Trending</h2>
                {[
                    "#CampusLife",
                    "#ExamSeason",
                    "#LibraryVibes",
                    "#StudentStruggles",
                ].map((tag) => (
                    <div
                        key={tag}
                        className="py-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                        <p className="font-bold">{tag}</p>
                        <p className="text-sm text-x-gray">
                            Trending on Campus
                        </p>
                    </div>
                ))}
            </div>
        </aside>
    );
}

export default RightSidebar;
