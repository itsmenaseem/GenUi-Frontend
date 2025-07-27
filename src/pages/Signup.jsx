// src/pages/Signup.jsx
import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setCredentials } from "../redux/authSlice";
import { useEffect } from "react";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const handleSignup = async(e) => {
    e.preventDefault();
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/auth/signup`,{
            ...form
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
      <form onSubmit={handleSignup} className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Signup</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          className="w-full p-2 border rounded-lg mb-3"
          value={form.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-2 border rounded-lg mb-3"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-2 border rounded-lg mb-3"
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600">
          Signup
        </button>

        <p className="text-sm mt-3">
          Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
