const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(
            data.message || "Something went wrong. Please try again.",
        );
    }
    return data;
}

export function loginUser(payload) {
    return request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function registerUser(payload) {
    return request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function requestPasswordReset(payload) {
    return request("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function getCurrentUser() {
    return request("/api/auth/me");
}

export function logoutUser() {
    return request("/api/auth/logout", { method: "POST" });
}
