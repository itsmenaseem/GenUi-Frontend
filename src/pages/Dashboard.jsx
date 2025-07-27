import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, Code2, Download, LogOut } from "lucide-react";
import Preview from "../components/Preview";
import Editor from "../components/Editor";
import AIChat from "../components/AIChat"
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";

export default function Dashboard() {
  const [run, setRun] = useState(0);
  const [code, setCode] = useState(`function App() {
  return <h1 className="text-pink-400 text-center">Hello from GenUI!</h1>;
}`);
  const [transpiledCode, setTranspiledCode] = useState();
  const [activeTab, setActiveTab] = useState("code");
  const token = useSelector((state)=>state.auth.token)
  const handleRun = async () => {
    setRun((prev) => prev + 1);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/transpile-code`, { code },{
        headers:{
          Authorization:`Bearer ${token}`
        },
        withCredentials:true
      });
      setTranspiledCode(response.data.transpiledCode);
    } catch (error) {
      // setTranspiledCode("```js\n// Error: Something went wrong during transpilation\n```");
      alert("Error: Something went wrong during transpilation\n")
      console.log(error);
      
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "GenUI-code.js";
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    handleRun();
  }, []);

  const onInsertCode = (code) => {
    setCode(code);
    // Optional: toast or animation instead of alert
  };
  const dispatch = useDispatch()
  async function handleLogout (){
        try {
            await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/auth/logout`,{withCredentials:true})
            dispatch(logout())
        } catch (error) {
            console.log(error);
            
        }
  }
  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-gray-100">
      {/* Left: AI Chat Assistant (50%) */}
      <aside className="w-1/2 border-r border-gray-300 bg-white shadow-inner overflow-hidden">
        <AIChat onInsertCode={onInsertCode} setCode={setCode} />
      </aside>

      {/* Right: Code + Preview Section (50%) */}
      <main className="w-1/2 flex flex-col overflow-hidden">
        {/* Toolbar */}
        {/* Toolbar */}
    <div className="flex items-center gap-3 px-4 py-3 border-b bg-white shadow-sm">
    <button
        onClick={() => setActiveTab("code")}
        className={`w-10 h-10 flex items-center justify-center rounded-md transition ${
        activeTab === "code" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
        }`}
        title="Code Editor"
    >
        <Code2 size={20} />
    </button>

    <button
        onClick={() => {
        setActiveTab("preview");
        handleRun();
        }}
        className={`w-10 h-10 flex items-center justify-center rounded-md transition ${
        activeTab === "preview" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
        }`}
        title="Preview Output"
    >
        <Eye size={20} />
    </button>

    {/* Spacer pushes buttons to right */}
    <div className="flex-grow" />

    {/* Download Button */}
    <button
        onClick={handleDownload}
        className="w-10 h-10 flex items-center justify-center rounded-md bg-green-500 hover:bg-green-600 text-white"
        title="Download Code"
    >
        <Download size={20} />
    </button>

    {/* Logout Button */}
    <button
        onClick={handleLogout}
        className="w-10 h-10 flex items-center justify-center rounded-md bg-red-500 hover:bg-red-600 text-white"
        title="Logout"
    >
        <LogOut size={20} />
    </button>
    </div>


        {/* Editor / Preview */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "code" ? (
            <Editor code={code} setCode={setCode} />
          ) : (
            <Preview transpiledCode={transpiledCode} run={run} />
          )}
        </div>
      </main>
    </div>
  );
}
