import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Menu from "./layout/Menu"
import ImportBook from "./pages/ImportBook"
import Login from "./pages/Login"
import Settings from "./pages/Settings"
import Downloads from "./pages/Downloads"
import Home from "./pages/Home"
import Library from "./pages/Library"
import FavoritesSeries from "./pages/FavoritesSeries"
import ErrorPage from "./pages/errors/ErrorPage"
import ManageUsers from "./pages/settings/ManageUsers"
import Jobs from "./pages/settings/Jobs"
import Reader, { readerLoader } from "./pages/Reader"

import SeriesPage, { seriesLoader } from "./pages/SeriesPage"

export const router = createBrowserRouter([
    {
      path: "/",
      element: <Menu />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Home /> },
        { path: "library", element: <Library /> },
        { path: "favorites", element: <FavoritesSeries /> },
        { path: "import", element: <ImportBook /> },
        { path: "downloads", element: <Downloads /> },
        {
          path: "settings",
          children: [
            { index: true, element: <Settings /> },
            { path: "manage-users", element: <ManageUsers /> },
            { path: "jobs", element: <Jobs /> },
          ],
        },
  
        // --- Series & Reader ---
        {
          path: "series/:seriesId",
          children: [
            { 
                index: true,
                loader: seriesLoader,
                element: <SeriesPage />,
            },
            {
              path: "book/:bookId",
              element: <Reader />,
              loader: readerLoader,
            },
          ],
        },
      ],
    },
    { path: "/login", element: <Login /> },
  ])
  

const Router = () => <RouterProvider router={router} />

export default Router
