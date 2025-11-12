import React, { useState } from "react";
import { createAccount, login } from "./services/authService";

function Login({ onLogin }) {
  const [accountId, setAccountId] = useState("");
  const [message, setMessage] = useState("");

  const handleCreateAccount = async () => {
    const data = await createAccount();
    setAccountId(data.account_id);
    setMessage("Cuenta creada. Guarda este ID para volver a ingresar.");
  };

  const handleLogin = async () => {
    if (!accountId) {
      setMessage("Ingresa tu Account ID");
      return;
    }
    const data = await login(accountId);
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("account_id", accountId);
      onLogin();
    } else {
      setMessage("Error al iniciar sesión");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-green-400 font-mono">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-widest text-green-400 drop-shadow-lg">
        404 FILES
      </h1>
      <div className="w-80 bg-black/60 p-6 rounded-lg shadow-lg flex flex-col space-y-4">
        <input
          type="text"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          placeholder="Ingresa tu Account ID"
          className="w-full px-3 py-2 rounded bg-black border border-green-600 text-green-300 focus:outline-none focus:border-green-400"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-2 rounded"
        >
          Iniciar sesión
        </button>
        <button
          onClick={handleCreateAccount}
          className="w-full bg-gray-700 hover:bg-gray-600 text-green-400 font-bold py-2 rounded"
        >
          Crear nueva cuenta
        </button>
        {message && <p className="text-sm text-green-300 mt-2">{message}</p>}
      </div>
    </div>
  );
}

export default Login;
