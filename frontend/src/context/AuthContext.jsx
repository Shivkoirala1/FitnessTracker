import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client.js";

const AuthContext = createContext(null);



  

  


export function useAuth() {
  return useContext(AuthContext);
}
