import {  Home, Import, LibraryBig } from "lucide-react";
import { Link, Outlet } from "react-router-dom";


const Menu = () => (
    <div className="flex flex-col h-screen">
        <div className="h-full">
            <Outlet/>
        </div>
        <div className="bg-gray-800 text-white p-4 flex justify-around items-center ">
            <Link to="/library" className="mr-4">
                <LibraryBig size={24} />
            </Link>
            <Link to="/">
                <Home size={24} />
            </Link>
            <Link to="/import" className="ml-4">
                <Import size={24} />
            </Link>

        </div>
    </div>
)

export default Menu