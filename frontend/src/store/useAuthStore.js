import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "";

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  login: async (username, password) => {
    set({ loading: true });
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        { username, password },
        { withCredentials: true }
      );
      set({ user: { username } });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      set({ user: null });
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/check`, { withCredentials: true });
      set({ user: { username: res.data.username } });
    } catch {
      set({ user: null });
    } finally {
      set({ checkingAuth: false });
    }
  },
}));
