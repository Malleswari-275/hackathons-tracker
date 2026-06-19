import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store";
import { router } from "@/router/routes";
import { Toaster } from "sonner";
import { useEffect } from "react";

function ThemeInit() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);
  return null;
}

function App() {
  return (
    <Provider store={store}>
      <ThemeInit />
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
        }}
      />
    </Provider>
  );
}

export default App;
