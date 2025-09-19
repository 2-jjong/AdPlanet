import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    {import.meta.env.DEV ? (
      <App /> // 개발환경: StrictMode 없이
    ) : (
      <StrictMode>
        <App /> // 운영환경: StrictMode 포함
      </StrictMode>
    )}
  </QueryClientProvider>
);
