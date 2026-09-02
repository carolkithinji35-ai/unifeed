import { useEffect } from "react";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";
import Bookmarks from "./pages/Bookmarks";
import ForgotPassword from "./pages/ForgotPassword";
import Explore from "./pages/Explore";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import FuturePage from "./components/FuturePage";
import Layout from "./components/Layout";

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Layout>
                <Routes>
                    <Route path="/" element={<Feed />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />
                    <Route path="/settings" element={<Settings />} />
                    <Route
                        path="/events"
                        element={<FuturePage type="events" />}
                    />
                    <Route
                        path="/communities"
                        element={<FuturePage type="communities" />}
                    />
                    <Route
                        path="/notifications"
                        element={<FuturePage type="notifications" />}
                    />
                    <Route
                        path="/messages"
                        element={<FuturePage type="messages" />}
                    />
                    <Route path="/bookmarks" element={<Bookmarks />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
