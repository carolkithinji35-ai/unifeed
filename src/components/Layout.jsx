import Header from "./Header";
import RightSidebar from "./Rightsidebar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
    return (
        <div className="min-h-screen overflow-x-hidden bg-[#0b0d10] text-slate-100 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
            <Header />

            <div className="mx-auto grid w-full max-w-370 grid-cols-1 gap-6 px-3 pb-24 pt-24 sm:px-6 sm:pb-24 sm:pt-24 lg:min-h-0 lg:flex-1 lg:grid-cols-[220px_minmax(0,1fr)_300px] lg:gap-6 lg:px-8 lg:pb-6 lg:pt-6">
                <div className="min-w-0 lg:min-h-0">
                    <Sidebar />
                </div>

                <main className="sidebar-scroll min-w-0 max-w-full lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-contain">
                    {children}
                </main>

                <div className="sidebar-scroll min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
                    <RightSidebar />
                </div>
            </div>
        </div>
    );
}

export default Layout;
