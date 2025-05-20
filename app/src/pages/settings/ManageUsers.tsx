import { useNavigate } from "react-router-dom";
import PageLayout from "../../layout/PageLayout";
import { useEffect, useState } from "react";
import { createUser, getAllUsers } from "../../services/Users";
import { useToast } from "../../contexts/ToastContext";
import { User } from "../../types";

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>();
  const { showToast } = useToast();

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch((err) => {
        console.error(err);
        showToast({
          type: "alert-error",
          message: "Error while getting users",
        });
      });
  }, []);

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const username = (e.currentTarget.username as HTMLInputElement).value;
    const password = (e.currentTarget.password as HTMLInputElement).value;

    if (!username || !password) {
      showToast({
        message: "Please fill in all fields",
        type: "alert-error",
      });
      return;
    }

    createUser(username, password)
      .then((res) => {
        showToast({
          message: "User created successfully",
          type: "alert-success",
        });
        setUsers((prev) => (prev ? [...prev, res] : [res]));
      })
      .catch((err) => {
        console.error(err);
        showToast({
          message: "Error creating user",
          type: "alert-error",
        });
      });
  };

  return (
    <PageLayout title="Manage Users" onBack={() => navigate("/settings")}>
      <div className="space-y-8 p-4">

        <div className="overflow-x-auto shadow rounded-lg bg-base-100">
          <table className="table table-zebra">
            <thead className="bg-base-200 text-base-content">
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user, index) => (
                <tr key={index}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>
                    <span className="badge badge-outline">{user.role}</span>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divider my-12">
            <h2>Create New User</h2>
        </div>




          <form className="form-control flex flex-col justify-center items-center gap-4" onSubmit={handleCreateUser}>
            <input
              type="text"
              id="username"
              placeholder="Username"
              className="input input-bordered w-full  max-w-xs"
              autoComplete="new-login"
            />
            <input
              type="password"
              id="password"
              placeholder="Password"
              className="input input-bordered w-full  max-w-xs"
              autoComplete="new-password"
            />
            <button className="btn btn-primary w-full max-w-xs mt-2" type="submit">
              Create User
            </button>
          </form>
        </div>
    </PageLayout>
  );
};

export default ManageUsers;
