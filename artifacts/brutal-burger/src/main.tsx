import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import { getAuthToken } from "@/lib/api-custom-fetch";

// Configure API client with auth token getter
setAuthTokenGetter(getAuthToken);

// Configure base URL for API calls
// We use relative URLs (empty base) so it works both in dev (with proxy) and prod
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";
setBaseUrl(apiBaseUrl);

createRoot(document.getElementById("root")!).render(<App />);
