import { useEffect, useState } from "react";
import { useToast } from "../contexts/ToastContext";
import Spinner from "../components/common/Spinner";
import { API_HOST } from "../types";
import { useNavigate } from "react-router-dom";


const Login = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const { showToast } = useToast();
    const [canRegister, setCanRegister] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!username || !password) {
            showToast({
                message: "Veuillez remplir tous les champs",
                type: "alert-error",
            });
            return;
        }

        const endpoint = canRegister ? "/users/register" : "/users/login";
        const errorMessages = {
            login: "Error during login",
            register: "Error during registration",
            invalidCredentials: "Invalid credentials",
            usernameInUse: "Username already in use",
        };

        setIsLoading(true);
        fetch(`${API_HOST}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        })
            .then((response) => {
                if (response.status === 200 || response.status === 201) {
                    return response.json();
                }else if (response.status === 401 && !canRegister) {
                    showToast({ message: errorMessages.invalidCredentials, type: "alert-error" });
                } else if (response.status === 409 && canRegister) {
                    showToast({ message: errorMessages.usernameInUse, type: "alert-error" });
                } else {
                    showToast({ message: canRegister ? errorMessages.register : errorMessages.login, type: "alert-error" });
                }
            })
            .then((data) => {
                if (data) {
                    localStorage.setItem("token", data.token);
                    navigate("/")
                }
            })
            .catch(() => {
                showToast({ message: canRegister ? errorMessages.register : errorMessages.login, type: "alert-error" });
            }).finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetch(`${API_HOST}/users/can_register`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => {
            if (response.status === 200) {
                setCanRegister(true);
            } else if (response.status === 403) {
                setCanRegister(false);
            } else {
                showToast({
                    message: "Une erreur est survenue lors de la vérification de l'inscription",
                    type: "alert-error",
                });
            }
        })

    }, []);

    if (canRegister === null) {
        return <div className="w-full h-screen flex items-center justify-center">
            <Spinner />
        </div>
    }

    return <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="w-full max-w-sm p-6 space-y-4 bg-base-100 rounded-xl shadow-lg">

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                    <label htmlFor="username" className="label">
                        <span className="label-text">Username</span>
                    </label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input input-bordered w-full"
                        required
                    />
                </div>

                <div className="form-control">
                    <label htmlFor="password" className="label">
                        <span className="label-text">Password</span>
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input input-bordered w-full"
                        required
                    />
                </div>



                <div className="form-control">
                    <button type="submit" className="btn btn-primary w-full flex gap-2" disabled={isLoading}>
                        {isLoading && <Spinner />}
                        
                        {canRegister ? "Sign in" : "Login"}
                    </button>
                </div>
            </form>


        </div>
    </div>
}

export default Login