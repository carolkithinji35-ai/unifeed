import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import FuturePage from "./components/FuturePage";
import Explore from "./pages/Explore";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Settings from "./pages/Settings";

// App is the root component. It wraps everything in a Router and defines routes.
function App() {
    return (
        <Router>
            {/* Layout provides the sidebar and right sidebar around all pages */}
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
                    <Route
                        path="/bookmarks"
                        element={<FuturePage type="bookmarks" />}
                    />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
