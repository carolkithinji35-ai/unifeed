import { createContext, useContext, useEffect, useState } from "react";
import {
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
} from "../lib/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentUser()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const signIn = async (credentials) => {
        const loggedInUser = await loginUser(credentials);
        setUser(loggedInUser);
        return loggedInUser;
    };

    const signUp = async (details) => {
        const newUser = await registerUser(details);
        setUser(newUser);
        return newUser;
    };

    const signOut = async () => {
        await logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, signIn, signUp, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
