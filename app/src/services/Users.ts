import { API_HOST, Me } from "../types";


export const getMe = (): Promise<Me> => {
    return new Promise((resolve, reject) => {
        const token = localStorage.getItem("token");
        fetch(`${API_HOST}/users/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        }).then((res) => {
            if (res.status == 200) {
                return res.json()
            } else {
                reject("Error while getting user info")
            }
        }).then((res) => {
            resolve(res.user)
        }).catch(() => reject("Error while getting user info"))
    })
}