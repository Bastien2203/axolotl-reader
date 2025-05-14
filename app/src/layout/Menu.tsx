import { Download, Home, Import, LibraryBig, LogOut, Moon, Search, Settings, Sun } from "lucide-react";
import { useEffect } from "react";
import {  Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { SeriesPageProvider } from "../contexts/SeriesPageContext";


const items = [
  { icon: Home, text: "Home", href: "/" },
  { icon: Search, text: "Search", href: "/search" },
  { icon: LibraryBig , text: "Library", href: "/library" },
  { icon: Import, text: "Import", href: "/import" },
  { icon: Download, text: "Downloads", href: "/downloads" },
  { icon: Settings, text: "Settings", href: "/settings" },
];

const Menu = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };


  const location = useLocation();

  const changeColorScheme = () => {
    const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  useEffect(() => {
    const theme = localStorage.getItem("theme") ?? "dark";
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return (
    <div className="flex bg-base-200 text-base-content flex-row overflow-hidden overscroll-none scroll-snap-stop ">
      <aside className="md:w-64 w-full bg-base-300 md:flex md:static fixed bottom-0 md:z-0 z-1 flex-col justify-between border-r border-base-100 pb-safe">
        <div>
          <div className="items-center gap-3 p-4 md:flex hidden">
            <img src="/icon.png" alt="icon" className="h-12" />
            <h1 className="text-xl font-semibold">Axolotl Reader</h1>
          </div>

          <nav className="flex md:flex-col md:justify-start w-full justify-around gap-1 px-2 md:py-0 py-2 ">
            {items.map(({ icon, text, href }) => (
              <MenuItem
                key={text}
                icon={icon}
                text={text}
                href={href}
                selected={location.pathname === href}
              />
            ))}
          </nav>
        </div>

        <div className="md:flex hidden items-center justify-between p-5 text-base-content">
          <label className="swap swap-rotate hover:opacity-80">
            <input type="checkbox" onChange={() => changeColorScheme()} />
            <Sun className="swap-off h-6 w-6 fill-current" />
            <Moon className="swap-on h-6 w-6 fill-current" />
          </label>

          <LogOut
            className="cursor-pointer hover:opacity-80"
            onClick={() => logout()}
          />
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-hidden pb-16 md:pb-0">
        <SeriesPageProvider>
          <Outlet />
        </SeriesPageProvider>
      </main>
    </div>
  );
};

const MenuItem = ({
  icon: Icon,
  text,
  selected,
  href,
}: {
  icon: React.FC<{ size: number }>;
  text: string;
  selected: boolean;
  href: string;
}) => (
  <Link to={href}
    className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${selected
        ? "bg-base-100 font-medium"
        : "hover:bg-base-200 text-base-content"
      }`}
  >

    <Icon size={20} />
    <span className="hidden md:block">{text}</span>
  </Link>
);

export default Menu;
