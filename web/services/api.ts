import { WidgetData } from "../types";

const API_BASE_URL = "http://localhost:8080/api";

export const api = {
  async getWidgets(): Promise<WidgetData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/widgets`);
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
      const response = await fetch(`${API_BASE_URL}/widgets/${id}`);
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
};
