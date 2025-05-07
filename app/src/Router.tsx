import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Menu from "./layout/Menu"
import Home from "./pages/Home"
import ImportBook from "./pages/ImportBook"
import Library from "./pages/Library"
import Login from "./pages/Login"
import Settings from "./pages/Settings"
import Downloads from "./pages/Downloads"


const Router = () => {

    const router = createBrowserRouter([
        {
            path: "/login",
            element: <Login />
        },
        {
            path: "/",
            element: <Menu />,
            children: [
                {
                    path: "/",
                    element: <Home />
                },
                {
                    path: "/import",
                    element: <ImportBook />
                },
                {
                    path: "/library",
                    element: <Library />
                }, 
                {
                    path: "/settings",
                    element: <Settings />
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