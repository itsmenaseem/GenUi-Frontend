import MonacoEditor from "@monaco-editor/react";

export default function Editor({ code, setCode }) {
  return (
    <MonacoEditor
      height="100vh"
      language="javascript"
      theme="vs-dark"
      value={code}
      onChange={(value) => setCode(value || "")}
      options={{
        minimap: { enabled: false },
        wordWrap: "on", 
        wrappingIndent: "same", 
        scrollBeyondLastLine: false,
      }}
    />
  );
}
