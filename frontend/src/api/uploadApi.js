import api from "./axios.js";

export const uploadImagesApi = async (files) => {
  if (!files || files.length === 0) return { data: { images: [] } };
  const fd = new FormData();
  for (const f of files) fd.append("images", f);
  const res = await api.post("/upload/multiple", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const uploadImageApi = async (file) => {
  const fd = new FormData();
  fd.append("image", file);
  const res = await api.post("/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
