import { Link } from "react-router-dom";

function Sidebar() {
    // menu and routes.
    const menuItems = [
        {
            label: "Home",
            icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
            path: "/",
        },
        {
            label: "Explore",
            icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
            path: "/explore",
        },
    ];

    return (
        <aside className="w-64 shrink-0 p-4 sticky top-0 h-screen">
            

            {/* nav links */}
            <nav className="space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.path}
                        className="flex items-center space-x-4 p-3 rounded-full hover:bg-x-lightgray transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={item.icon}
                            />
                        </svg>
                        <span className="text-xl">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* //placholder btn */}
            <button className="mt-6 w-full bg-x-blue text-white rounded-full py-3 font-bold hover:bg-blue-600 transition-colors">
                Post
            </button>
        </aside>
    );
}

export default Sidebar;
