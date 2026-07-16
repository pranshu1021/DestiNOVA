import axios from "axios";

const api = axios.create({

    baseURL:"10.0.2.2:5000/api/auth",
    headers: {
        "Content-Type": "application/json"
    }
})
export default api;