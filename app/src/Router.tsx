import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Menu from "./layout/Menu"
import ImportBook from "./pages/ImportBook"
import Login from "./pages/Login"
import Settings from "./pages/Settings"
import Downloads from "./pages/Downloads"
import CreateUser from "./pages/settings/CreateUser"
import Home from "./pages/Home"
import SearchPage from "./pages/SearchPage"


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
                    path: "/search",
                    element: <SearchPage />
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
                            path: "create-user",
                            element: <CreateUser />
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