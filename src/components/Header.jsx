import { Link } from "react-router-dom";
import {User} from "lucide-react";

// Header component: appears at the top of every page
function Header() {
    return (
        <header className="bg-white border-b border-x-lightgray sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
                {/* Logo / Brand */}
                <Link to="/" className="flex items-center space-x-2">
                    {/* Small X-style logo icon */}
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">U</span>
                    </div>
                    <span className="text-xl font-bold font-mono ">UniFeed</span>
                </Link>

                

                {/* Optional: small avatar placeholder on the right */}
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center" title="profile">
                    <User size={18}/>
                </div>
            </div>
        </header>
    );
}

export default Header;
