
import axios from "axios";
import { API_URL} from "../Services/config";
export default async function Axioscall(
  method,
  endpoint,
  datalist,
  requiresAuth = true
) {
  try {
    const base_url = `${API_URL}/${endpoint}`;
    
    const config = {
      method,
      url: base_url,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // ✅ Attach token by default (opt-out instead of opt-in)
    if (requiresAuth) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("No auth token found for authenticated request");
      }
    }

    // ✅ GET requests use `params` (no encryption for query params)
    if (method.toUpperCase() === "GET") {
      config.params = datalist;
    } else {
      // ✅ Encrypt request body if SecurityStatus is "Enable"
      let requestData = datalist;
      
      if (datalist) {
        console.log("🔒 Encryption enabled - encrypting request body");
        const jsonString = datalist;
        const encryptedData = jsonString;
        requestData = { data: encryptedData };
      }
      
      config.data = requestData;
    }

    const response = await axios(config);
   
    // ✅ Decrypt response data if SecurityStatus is "Enable"
    if ( response.data) {
      console.log("🔓 Encryption enabled - decrypting response data");
      const decryptedData = response.data;
      return { ...response, data: decryptedData };
    }

    // Return response as-is when encryption is disabled
    return response;

  } catch (error) {
    console.error("Axios Error:", error.response || error);

    if (error.response?.status === 401 || error.response?.status === 403) {
      
      localStorage.clear();
      window.location.href = "/";
    }

    throw error; // Re-throw to let caller handle it
  }
}