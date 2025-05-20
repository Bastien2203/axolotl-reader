import { API_HOST, User } from "../types";


export const getMe = (): Promise<User> => {
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


export const createUser = (username: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        const token = localStorage.getItem("token");
        fetch(`${API_HOST}/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                username,
                password
            })
        }).then((res) => {
            if (res.status == 201) {
                return res.json()
            } else {
                reject("Error while creating user")
            }
        }).then((res) => {
            resolve(res.user)
        }).catch(() => reject("Error while creating user"))
    })
}


export const getAllUsers = (): Promise<User[]> => {
    return new Promise((resolve, reject) => {
        const token = localStorage.getItem("token");
        fetch(`${API_HOST}/users`, {
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
            resolve(res)
        }).catch(() => reject("Error while getting user info"))
    })
}
