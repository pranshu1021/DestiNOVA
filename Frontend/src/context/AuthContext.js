import React, {
    useState, 
    useEffect,
    createContext
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import api from "../services/api"
export const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
    const [user, setUser]= useState(null);
    const [token, setToken]= useState(null);
    const [loading,setLoading]= useState(true);



const checkLogin = async () => {
  try {
    const savedToken = await AsyncStorage.getItem("token");

    if (!savedToken) {
      return;
    }

    setToken(savedToken);
    api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;

    const response = await api.get("/auth/profile");
    const latestUser = response.data.user;

    await AsyncStorage.setItem("user", JSON.stringify(latestUser));
    setUser(latestUser);
  } catch (error) {
    console.log("Check Login Error:", error);
    await AsyncStorage.multiRemove(["token", "user", "provider"]);
    setUser(null);
    setToken(null);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  checkLogin();
}, []);

const refreshUserProfile = React.useCallback(async () => {
  try {
    const response = await api.get("/auth/profile");
    const latestUser = response.data.user;
    await AsyncStorage.setItem("user", JSON.stringify(latestUser));
    setUser(latestUser);
    return latestUser;
  } catch (error) {
    console.log("Refresh Profile Error:", error);
    return null;
  }
}, []);

const login = async (token, user) => {

  api.defaults.headers.common.Authorization = `Bearer ${token}`;

  await AsyncStorage.setItem("token", token);

  await AsyncStorage.setItem(
    "user",
    JSON.stringify(user)
  );

  setToken(token);
  setUser(user);
};

const updateUser = async (updatedUser) => {
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
};

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
    delete api.defaults.headers.common.Authorization;
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
            updateUser,
            refreshUserProfile,
            logout
        }}
        >
       {children}
    </AuthContext.Provider>
)
}

export default AuthProvider;
