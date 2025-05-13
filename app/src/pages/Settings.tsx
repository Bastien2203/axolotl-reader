import { LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { API_HOST, Me } from "../types";
import { useEffect, useState } from "react";
import { useToast } from "../contexts/ToastContext";
import Spinner from "../components/common/Spinner";
import PageLayout from "../layout/PageLayout";

interface Setting {
    type: "link" | "button";
    name: string;
    icon?: React.FC<{ size: number }>;
    color?: string;
    adminOnly?: boolean
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
        adminOnly: true
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

    const [me, setMe] = useState<Me>();
    const navigate = useNavigate();
    const {showToast} = useToast()

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        fetch(`${API_HOST}/users/me`, {
            method: "GET",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : "Bearer " + token
            }
        }).then((res) => {
            if(res.status == 200) {
                return res.json()
            } else {
                showToast({
                    message: "Error while getting user info",
                    type: "alert-error"
                })
            }
        }).then((res) => {
            setMe(res.user)
            console.log(res.user)
        }).catch(() => showToast({
                message: "Error while getting user info",
                type: "alert-error"
            }))
    }, [])



    if (!me) {
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <Spinner/>
        </div>

    }

    return <PageLayout title="Settings">
        <h2 className="text-base-content/80">
            Logged as {me?.Username}
        </h2>

        <ul className="list text-base">
            {
                settings.map((setting, index) => {
                    if(setting.adminOnly && me?.Role != "admin") {
                        return null
                    }
                    else if (setting.type === "link") {
                        return (
                            <Link to={(setting as LinkSetting).href} key={index} className={`text-base list-row cursor-pointer ${setting.color} hover:bg-base-200`}>
                                {setting.icon && <setting.icon size={24} />}
                                {setting.name}
                            </Link>
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
    </PageLayout>
}

export default Settings;