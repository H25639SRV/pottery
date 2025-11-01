// src/api/renderAPI.ts
import axios from "axios";

export const uploadPattern = async (file: File) => {
  const formData = new FormData();
  formData.append("pattern", file);
  const res = await axios.post("/api/render", formData);
  return res.data;
};
