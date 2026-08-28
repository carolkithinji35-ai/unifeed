const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(
            data.error ||
                data.message ||
                "Something went wrong. Please try again.",
        );
        error.status = response.status;
        throw error;
    }

    return data;
}

export function loginUser({ identifier, email, password }) {
    return apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email: email || identifier,
            password,
        }),
    });
}

export function registerUser({ username, email, password }) {
    return apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
    });
}

export function requestPasswordReset(payload) {
    return apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function getCurrentUser() {
    return apiRequest("/api/auth/me");
}

export function logoutUser() {
    return apiRequest("/api/auth/logout", { method: "POST" });
}
