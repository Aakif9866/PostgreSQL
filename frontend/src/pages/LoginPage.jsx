import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { ShoppingCartIcon } from "lucide-react";

function LoginPage() {
  const { login, loading } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col items-center mb-4 gap-2">
            <ShoppingCartIcon className="size-10 text-primary" />
            <h2 className="card-title text-2xl">POSGRESTORE</h2>
            <p className="text-sm text-base-content/60">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                placeholder="Enter username"
                className="input input-bordered w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
