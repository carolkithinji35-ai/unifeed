import { useCallback, useEffect, useState } from "react";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import FuturePage from "./components/FuturePage";
import Layout from "./components/Layout";
import SplashScreen from "./components/SplashScreen";
import Bookmarks from "./pages/Bookmarks";
import CreatePost from "./pages/CreatePost";
import Explore from "./pages/Explore";
import ForgotPassword from "./pages/ForgotPassword";
import Groups from "./pages/Groups";
import GroupInvite from "./pages/GroupInvite";
import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import UniversityDashboard from "./pages/UniversityDashboard";

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function StudentRoutes() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/events" element={<FuturePage type="events" />} />
                <Route
                    path="/communities"
                    element={<FuturePage type="communities" />}
                />
                <Route path="/groups" element={<Groups />} />
                <Route path="/group-invite/:token" element={<GroupInvite />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/create-post" element={<CreatePost />} />
            </Routes>
        </Layout>
    );
}

function AppContent() {
    const [showSplash, setShowSplash] = useState(true);
    const { user, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (
            !loading &&
            user?.role === "university_admin" &&
            location.pathname === "/"
        ) {
            navigate("/university-dashboard", { replace: true });
        }
    }, [loading, location.pathname, navigate, user?.role]);

    const finishSplash = useCallback(() => {
        setShowSplash(false);
    }, []);

    if (showSplash) {
        return <SplashScreen onFinish={finishSplash} />;
    }

    return (
        <Routes>
            <Route
                path="/university-dashboard"
                element={<UniversityDashboard />}
            />
            <Route path="*" element={<StudentRoutes />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <ScrollToTop />
            <AppContent />
        </Router>
    );
}

export default App;
