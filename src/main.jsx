// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import Gallery from "./pages/Gallery.jsx";
import Donate from "./pages/Donate.jsx";
import Legal from "./pages/Legal.jsx";
import Tax from "./pages/Tax.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,           // ⬅️ layout route that contains <Outlet/>
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "services", element: <Services /> },
      { path: "gallery", element: <Gallery /> },
      { path: "donate", element: <Donate /> },
      { path: "legal", element: <Legal /> },
      { path: "tax", element: <Tax /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
