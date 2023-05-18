import * as React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppContextProvider from "./components/hooks/context";
import SAM from "./SAM";
import Hugging from "./Hugging";
import HuggingImageList from "./components/HuggingImageList";

import ErrorPage from "./error-page";

const container = document.getElementById("root");
const root = createRoot(container!);

const routers = createBrowserRouter([
  {
    path: "/",
    element: <SAM />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/hugging",
    element: <Hugging />,
  },
  {
    path: "/huggingImageList",
    element: <HuggingImageList />,
  },
]);

root.render(
  <AppContextProvider>
    <RouterProvider router={routers} />
  </AppContextProvider>
);
