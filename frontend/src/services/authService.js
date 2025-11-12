const API = "http://localhost:4000";

export async function createAccount() {
  const res = await fetch(`${API}/create-account`, { method: "POST" });
  return res.json();
}

export async function login(account_id) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account_id }),
  });
  return res.json();
}

export async function whoami(token) {
  const res = await fetch(`${API}/whoami`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
