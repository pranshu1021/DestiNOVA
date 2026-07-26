import React, {
    useState, 
    useEffect,
    createContext
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
    const [user, setUser]= useState(null);
    const [token, setToken]= useState(null);
    const [loading,setLoading]= useState(true);



const checkLogin = async() => {
    try{
        const savedToken = await AsyncStorage.getItem("token");
        const savedUser = await AsyncStorage.getItem("user");
            if ( savedToken && savedUser){
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            }
    }
    catch(error){
        console.log(error);
    }
    finally{
        setLoading(false);
    }
};

useEffect(()=>{
    checkLogin();
},[])


const login = async(token, user) =>{
    await AsyncStorage.setItem(
        "token", token
    )

    await AsyncStorage.setItem(
        "user",
        JSON.stringify(user)
    );

    setToken(token);
    setUser(user);

}

// LOGOUT function niche

const logout = async()=>{
    try{
    const provider = await AsyncStorage.getItem("provider");
    if(provider === "google"){
        await GoogleSignin.signOut();
    }

    await AsyncStorage.multiRemove([
        "token",
        "user",
        "provider",
    ])
    setToken(null);
    setUser(null);
    }
    catch(error){
        console.log("Logout Error:", error)
    }

}

return (
    <AuthContext.Provider
     value = {{
            user,
            token,
            loading,
            login,
            logout
        }}
        >
       {children}
    </AuthContext.Provider>
)
}

export default AuthProvider;