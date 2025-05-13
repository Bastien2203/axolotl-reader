import { useNavigate } from "react-router-dom"
import { useToast } from "../../contexts/ToastContext"
import { API_HOST } from "../../types"
import PageLayout from "../../layout/PageLayout"


const CreateUser = () => {
    const { showToast } = useToast()
    const navigate = useNavigate();


    const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const username = (e.currentTarget.username as HTMLInputElement).value
        const password = (e.currentTarget.password as HTMLInputElement).value
        console.log(username, password)
        if (!username || !password) {
            showToast({
                message: "Please fill in all fields",
                type: "alert-error"
            })
            return
        }
        const response = await fetch(API_HOST + "/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                username,
                password
            })
        })
        if (response.status == 201) {
            console.log("success")
            showToast({
                message: "User created successfully",
                type: "alert-success"
            })
            navigate("/settings")
         
        } else {
            showToast({
                message: "Error creating user",
                type: "alert-error"
            })
        }
    }

    return <PageLayout
        title="Create User"
        onBack={() => navigate("/settings")}
    >
        <form className="flex flex-col items-center justify-center gap-4" onSubmit={handleCreateUser}>
            <input type="text" id="username" placeholder="Username" className="input input-bordered w-full max-w-xs" autoComplete="new-login" />
            <input type="password" id="password" placeholder="Password" className="input input-bordered w-full max-w-xs" autoComplete="new-password" />
            <button className="btn btn-primary mt-4  w-full max-w-xs" type="submit">Create User</button>
        </form>

    </PageLayout>
}

export default CreateUser