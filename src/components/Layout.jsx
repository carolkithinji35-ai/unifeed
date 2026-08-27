import Header from "./Header";
import Sidebar from "./Sidebar";
import RightSidebar from "./Rightsidebar";

function Layout({ children }) {
    return (
        <div className="min-h-screen bg-[#0b0d10] text-slate-100">
            <Header />
            <div className="mx-auto grid max-w-370 grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)_300px] lg:px-8">
                <Sidebar />
                <main className="min-w-0">{children}</main>
                <RightSidebar />
            </div>
        </div>
    );
}

export default Layout;
