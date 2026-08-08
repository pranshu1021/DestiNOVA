import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"
const api = axios.create({

baseURL:"http://10.0.2.2:5000/api",
    // baseURL:"http://192.168.1.3:5000/api",
    headers: {
        "Content-Type": "application/json"
    }
});
// config ke andar saara data hota hai request ka jese ki
// konsi type ki req h
// kaha se aari h  url
// headers
api.interceptors.request.use(
    async(config)=>{
        try{
            const token = await AsyncStorage.getItem("token");

            if(token){
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        catch(error){
            console.log("Interceptor Error: ", error);
        }
        return config;
    },
    (error) =>{
        return Promise.reject(error);
    }
)
export default api;