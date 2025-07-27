// src/pages/Login.jsx
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setCredentials } from "../redux/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const token = useSelector((state)=>state.auth.token)
  const handleLogin = async(e) => {
    e.preventDefault();
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/auth/login`,{
            email,password
        },{withCredentials:true})
        dispatch(setCredentials({token:response.data.accessToken}))
        navigate("/dashboard")
    } catch (error) {
        console.log(error);
    }
  };
  async function refreshToken (){
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/auth/refresh`,{
                withCredentials:true
            })
            dispatch(setCredentials({token:response.data.accessToken}))
            navigate("/dashboard")
        } catch (error) {
            console.log(error);
        }
  }
  useEffect(()=>{
    refreshToken()
  },[])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded-lg mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded-lg mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-blue-600">
          Login
        </button>

        {/* Create Account Link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Create New Account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
