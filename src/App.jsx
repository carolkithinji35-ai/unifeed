import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";

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
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
