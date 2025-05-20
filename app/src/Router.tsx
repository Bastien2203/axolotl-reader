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


const Router = () => {

    const router = createBrowserRouter([
        {
            path: "/login",
            element: <Login />
        },
        {
            path: "/",
            element: <Menu />,
            errorElement: <ErrorPage/>,
            children: [
                {
                    path: "/",
                    element: <Home />
                },
                {
                    path: "/favorites",
                    element: <FavoritesSeries />
                },
                {
                    path: "/library",
                    element: <Library/>
                },
                {
                    path: "/import",
                    element: <ImportBook />
                },
                {
                    path: "/settings",
                    children: [
                        {
                            path: "",
                            element: <Settings />
                        },
                        {
                            path: "manage-users",
                            element: <ManageUsers />
                        },
                        {
                            path: "jobs",
                            element: <Jobs/>
                        }
                    ]
                },
                {
                    path: "/downloads",
                    element: <Downloads/>
                }
            ]
        }
    ])

    return <RouterProvider router={router} />
}

export default Router