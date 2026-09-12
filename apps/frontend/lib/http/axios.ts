import axios from "axios";
import axiosRetry from "axios-retry";

const axiosInstance = axios.create({
    baseURL: typeof window === "undefined" ? process.env.NEXT_PUBLIC_API_URL : "/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 30000, // Increased to 30s to allow backend cold starts on Vercel
});

// Add request interceptor to handle /api prefix for client-side rewrites
axiosInstance.interceptors.request.use(
    (config) => {
        // Only prefix on the client and if it's a relative path starting with /
        if (typeof window !== "undefined" && config.url?.startsWith("/") && !config.url.startsWith("/api")) {
            // We don't use baseURL on the client anymore to avoid Axios path replacement issues
            config.baseURL = "";
            config.url = `/api${config.url}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add retry logic with exponential backoff to prevent thundering herd
axiosRetry(axiosInstance, {
    retries: 3,
    retryDelay: (retryCount) => {
        // Exponential backoff with jitter: base * 2^retryCount + random(0-1000ms)
        const baseDelay = 1000;
        const exponentialDelay = baseDelay * Math.pow(2, retryCount - 1);
        const jitter = Math.random() * 1000;
        return Math.min(exponentialDelay + jitter, 10000); // Cap at 10s
    },
    retryCondition: (error) => {
        // Retry on network errors, timeouts, and 5xx server errors, but not 4xx client errors
        const isSafeMethod = ["get", "head", "options"].includes(
            error.config?.method?.toLowerCase() || ""
        );

        return (
            isSafeMethod &&
            (axiosRetry.isNetworkError(error) ||
                error.code === 'ECONNABORTED' ||
                (error.response?.status ? error.response.status >= 500 : false))
        );
    },
    shouldResetTimeout: true, // Reset timeout on each retry
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
            const url: string = error.config?.url ?? "";
            // Never hijack the session probe or auth endpoints themselves.
            // useMe() intentionally returns null on 401 so public pages and
            // guards can render gracefully instead of hard-reloading.
            const isAuthEndpoint =
                url.includes("/auth/me") ||
                url.includes("/auth/login") ||
                url.includes("/auth/register") ||
                url.includes("/auth/logout");
            if (isAuthEndpoint) {
                return Promise.reject(error);
            }

            const pathname = window.location.pathname;
            // Already on an auth page -> don't reload, the forms handle it.
            const isOnAuthPage =
                pathname === "/login" ||
                pathname.startsWith("/account/login") ||
                pathname.startsWith("/account/register");
            if (isOnAuthPage) {
                return Promise.reject(error);
            }

            // Only bounce when the user is actually on a protected route.
            // Public pages (/, /shop, /product/...) call useMe() via the
            // Navbar and must not redirect guests to login on 401.
            const isProtectedRoute =
                pathname.startsWith("/admin") || pathname.startsWith("/account");
            if (!isProtectedRoute) {
                return Promise.reject(error);
            }

            const target = pathname.startsWith("/admin") ? "/login" : "/account/login";
            // Guard against redirect loops (e.g. stale token repeatedly 401ing).
            if (pathname !== target) {
                window.location.href = target;
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance
