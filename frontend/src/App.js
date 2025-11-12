import React, { useState, useEffect } from "react";
import Login from "./Login";
import { whoami } from "./services/authService";
import { v4 as uuidv4 } from "uuid";

function FileUploader() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "http://proyecto-grupo6-alb-1743078614.us-east-1.elb.amazonaws.com/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      const fileCode = uuidv4();
      setMessage(`Archivo subido: ${data.originalName}`);
      setDownloadUrl(
        `${window.location.origin}/uploads/${data.filename}?code=${fileCode}`
      );
    } catch (err) {
      setMessage("Error al subir el archivo");
    }
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-green-400 font-mono"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="w-full h-full flex flex-col items-center justify-center border-4 border-dashed border-green-500 rounded-lg transition-all duration-300 hover:bg-black/40">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-widest text-green-400 drop-shadow-lg">
          404 FILES
        </h1>

        <p className="mb-6 text-lg text-green-300/80">
          Sube tu archivo de manera segura
        </p>

        <input
          type="file"
          onChange={handleFileChange}
          className="mb-6 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
                     file:text-sm file:font-semibold file:bg-green-600 file:text-black
                     hover:file:bg-green-500 cursor-pointer"
        />

        <button
          onClick={handleUpload}
          className="px-8 py-3 bg-green-600 text-black font-bold rounded-md 
                     hover:bg-green-500 transition-all duration-200"
        >
          SUBIR ARCHIVO
        </button>

        {message && (
          <p className="mt-6 text-green-300 text-lg animate-pulse">{message}</p>
        )}
        {downloadUrl && (
          <div className="mt-4 p-4 bg-black/50 rounded-md">
            <p className="text-green-400">Enlace generado:</p>
            <a
              href={downloadUrl}
              className="text-green-300 underline break-all hover:text-green-200"
            >
              {downloadUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      whoami(token).then((data) => {
        if (data.ok) setIsLoggedIn(true);
      });
    }
  }, []);

  return isLoggedIn ? (
    <FileUploader />
  ) : (
    <Login onLogin={() => setIsLoggedIn(true)} />
  );
}

export default App;
