import { useEffect, useRef } from "react";

export default function Preview({ transpiledCode ,run}) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!transpiledCode) return;

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
  }, [transpiledCode,run]);

  return (
    <iframe
      ref={iframeRef}
      title="Live Preview"
      sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
      style={{ width: "100%", height: "100%", border: "1px solid #ccc" }}
    />
  );
}
