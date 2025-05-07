import { LogOut } from "lucide-react";

interface Setting {
    type: "link" | "button";
    name: string;
    icon?: React.FC<{ size: number }>;
    color?: string;
}

interface LinkSetting extends Setting {
    href: string;
}

interface ButtonSetting extends Setting {
    action: () => void;
}

type SettingItem = LinkSetting | ButtonSetting;

const settings: SettingItem[] = [
    {
        type: "link",
        name: "Create User",
        href: "create-user",
    },
    {
        type: "link",
        name: "Change Password",
        href: "change-password",
    },
    {
        type: "link",
        name: "Reader Settings",
        href: "reader-settings"
    },
    {
        type: "button",
        name: "Logout",
        icon: LogOut,
        color: "text-red-200",
        action: () => {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
    }
]

const Settings = () => {
    return <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <ul className="list text-base">
            {
                settings.map((setting, index) => {
                    if (setting.type === "link") {
                        return (
                            <a onClick={
                                () => {
                                    window.location.href += `/${(setting as LinkSetting).href}`;
                                }
                            } key={index} className={`text-base list-row cursor-pointer ${setting.color} hover:bg-base-200`}>
                                {setting.icon && <setting.icon size={24} />}
                                {setting.name}
                            </a>
                        )
                    } else if (setting) {
                        return (
                            <a
                                key={index}
                                className={`text-base list-row cursor-pointer ${setting.color} hover:bg-base-200`}
                                onClick={(setting as ButtonSetting).action}
                            >
                                {setting.icon && <setting.icon size={24} />}
                                {setting.name}
                            </a>
                        )
                    }
                    return null;
                })

            }
            

        </ul>
    </div>
}

export default Settings;