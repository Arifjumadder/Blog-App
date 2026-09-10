import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import axios from "axios";

export const AuthContext =createContext()

export const AuthContextProvider=({children})=>{
    const [currentUser,setCurrentUser]=useState(JSON.parse(localStorage.getItem("user")) || null)

    const login=async(inputs)=>{
        const res= await axios.post("/api/auth/login",inputs);
        setCurrentUser(res.data);

    };

        const logout=async(inputs)=>{
        const res= await axios.post("/api/auth/logout");
        setCurrentUser(null);

    };

    const updateUser = (data) => {
        setCurrentUser((prev) => ({ ...prev, ...data }));
    };

    useEffect(()=>{
        localStorage.setItem("user",JSON.stringify(currentUser));
    }, [currentUser]);

    return(
        <AuthContext.Provider value={{currentUser,login,logout,updateUser}}>
            {children}
        </AuthContext.Provider>
    )

}