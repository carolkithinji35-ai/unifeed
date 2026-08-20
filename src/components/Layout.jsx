import Header from "./Header";
import Sidebar from "./Sidebar";
import RightSidebar from "./Rightsidebar";

function Layout({ children, darkMode, setDarkMode }) {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
            <Header darkMode={darkMode} setDarkMode={setDarkMode} />
            <div className="max-w-7xl mx-auto flex">
                <Sidebar />
                <main className="flex-1 min-w-0 border-x border-gray-200 dark:border-gray-800">
                    {children}
                </main>
                <RightSidebar />
            </div>
        </div>
    );
}

export default Layout;
