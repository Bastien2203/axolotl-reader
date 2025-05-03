import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Menu from "./layout/Menu"
import Home from "./pages/Home"
import ImportBook from "./pages/ImportBook"




const Router = () => {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Menu/>,
            children: [
                {
                    path: "/",
                    element: <Home/>
                },
                {
                    path: "/import",
                    element: <ImportBook/>
                }
            ]
        }
    ])

    return <RouterProvider router={router} />
}

export default Router