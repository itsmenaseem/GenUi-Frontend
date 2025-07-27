import { useEffect, useRef, useState } from "react";

export default function Preview({ transpiledCode, run }) {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!transpiledCode) return;

    setLoading(true); // show spinner when new code runs

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
          <style>
            body { margin: 0; font-family: sans-serif; }
          </style>
        </head>
        <body>
          <div id="root"></div>

          <script>
            window.onerror = function(message, source, lineno, colno, error) {
              const pre = document.createElement('pre');
              pre.style.color = 'red';
              pre.textContent = 'Runtime Error: ' + message;
              document.body.appendChild(pre);
            };

            try {
              ${transpiledCode}
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(React.createElement(App));
            } catch (e) {
              document.body.innerHTML = '<pre style="color: red;">' + e.message + '</pre>';
            }
          </script>
        </body>
      </html>
    `;

    iframeRef.current.srcdoc = html;
  }, [transpiledCode, run]);

  // Hide spinner once iframe finishes loading
  const onLoadHandler = () => {
    setLoading(false);
  };

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          {/* Simple spinner */}
          <svg
            className="animate-spin h-10 w-10 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="Live Preview"
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        style={{ width: "100%", height: "100%", border: "1px solid #ccc" }}
        onLoad={onLoadHandler}
      />
    </div>
  );
}
