import { WidgetData } from "../types";

const API_BASE_URL = "/api";

export const api = {
  async getWidgets(): Promise<WidgetData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/widgets`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch widgets");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching widgets:", error);
      return [];
    }
  },

  async saveWidget(widget: WidgetData): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/widgets/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(widget),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to save widget");
      }
    } catch (error) {
      console.error("Error saving widget:", error);
      throw error;
    }
  },

  async deleteWidget(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/widgets/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete widget");
      }
    } catch (error) {
      console.error("Error deleting widget:", error);
      throw error;
    }
  },

  async getWidgetById(id: string): Promise<WidgetData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/widgets/${id}`, {
        credentials: "include",
      });
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch widget");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching widget by ID:", error);
      return null;
    }
  },

  // --- Auth ---
  async checkAuthStatus(): Promise<{ registered: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/status`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to check auth status");
      return await response.json();
    } catch (error) {
      console.error("Error checking auth status:", error);
      return { registered: false };
    }
  },

  async register(
    username: string,
    password: string
  ): Promise<{ success: boolean; message?: string; username?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      return await response.json();
    } catch (error) {
      console.error("Error registering:", error);
      return { success: false, message: "Network error" };
    }
  },

  async login(
    username: string,
    password: string
  ): Promise<{ success: boolean; message?: string; username?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      if (response.status === 401) {
        return { success: false, message: "Invalid credentials" };
      }
      return await response.json();
    } catch (error) {
      console.error("Error logging in:", error);
      return { success: false, message: "Network error" };
    }
  },

  // --- Push Notifications ---
  async getVapidKey(): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/push/vapid-key`, {
        credentials: "include",
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.publicKey;
    } catch (error) {
      console.error("Error fetching VAPID key:", error);
      return null;
    }
  },

  async subscribeToPush(subscription: PushSubscription): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
        credentials: "include",
      });
    } catch (error) {
      console.error("Error subscribing to push:", error);
    }
  },

  async sendTestNotification(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/push/send-test`, {
        credentials: "include",
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
    }
  },
};
