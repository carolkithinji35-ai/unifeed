import Header from "./Header";
import RightSidebar from "./Rightsidebar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
    return (
        <div className="min-h-screen overflow-x-hidden bg-[#0b0d10] text-slate-100">
            <Header />

            <div className="mx-auto grid max-w-370 grid-cols-1 gap-6 px-3 py-4 pb-24 sm:px-6 sm:py-6 sm:pb-24 lg:grid-cols-[220px_minmax(0,1fr)_300px] lg:px-8 lg:pb-6">
                <Sidebar />

                <main className="min-w-0 max-w-full overflow-hidden">
                    {children}
                </main>

                <RightSidebar />
            </div>
        </div>
    );
}

export default Layout;
