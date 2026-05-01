import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { uploadImagesApi, uploadImageApi } from "../../api/uploadApi.js";

export default function ImageUploader({
  value = [],
  onChange,
  multiple = true,
  max = 8,
  label = "Images",
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState("upload"); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState("");

  const urls = Array.isArray(value) ? value : value ? [value] : [];

  const emit = (next) => {
    if (multiple) onChange(next);
    else onChange(next[0] || "");
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    if (multiple && urls.length + files.length > max) {
      toast.error(`Maximum ${max} images`);
      return;
    }
    setUploading(true);
    try {
      if (multiple) {
        const slice = files.slice(0, max - urls.length);
        const res = await uploadImagesApi(slice);
        const newUrls = res.data.images.map((i) => i.url);
        emit([...urls, ...newUrls]);
      } else {
        const res = await uploadImageApi(files[0]);
        emit([res.data.url]);
      }
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const isValidUrl = (s) => {
    try {
      const u = new URL(s);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const addByUrl = () => {
    const v = urlInput.trim();
    if (!v) return;
    if (!isValidUrl(v)) {
      toast.error("Please enter a valid http(s) image URL");
      return;
    }
    if (multiple) {
      if (urls.includes(v)) {
        toast.error("This URL is already added");
        return;
      }
      if (urls.length >= max) {
        toast.error(`Maximum ${max} images`);
        return;
      }
      emit([...urls, v]);
    } else {
      emit([v]);
    }
    setUrlInput("");
    toast.success("Image link added");
  };

  const removeAt = (i) => {
    const next = urls.filter((_, idx) => idx !== i);
    emit(next);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const onClickUpload = () => inputRef.current?.click();

  const reachedMax = multiple && urls.length >= max;

  return (
    <div>
      {label && <p className="label">{label}</p>}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {urls.map((u, i) => (
          <div
            key={u + i}
            className="relative aspect-square rounded-lg overflow-hidden ring-1 ring-slate-200 bg-slate-50 group"
          >
            <img src={u} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1.5 right-1.5 h-7 w-7 grid place-items-center rounded-full bg-slate-900/80 text-white text-xs hover:bg-rose-500 transition opacity-0 group-hover:opacity-100"
              aria-label="Remove image"
            >
              ✕
            </button>
            {i === 0 && multiple && (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-brand-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                Cover
              </span>
            )}
          </div>
        ))}

        {!reachedMax && mode === "upload" && (
          <button
            type="button"
            onClick={onClickUpload}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            disabled={uploading}
            className={`aspect-square rounded-lg ring-2 border-dashed grid place-items-center text-sm transition ${
              dragOver
                ? "ring-brand-500 bg-brand-50/60"
                : "ring-slate-300 hover:ring-brand-400 hover:bg-slate-50"
            } ${uploading ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
          >
            <div className="text-center px-2">
              {uploading ? (
                <>
                  <div className="h-6 w-6 mx-auto rounded-full border-[3px] border-brand-100 border-t-brand-500 animate-spin" />
                  <p className="text-xs text-slate-500 mt-2">Uploading...</p>
                </>
              ) : (
                <>
                  <p className="text-2xl text-slate-400">＋</p>
                  <p className="text-xs font-semibold text-slate-700">Upload</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    or drag & drop
                  </p>
                </>
              )}
            </div>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {!reachedMax && (
        <div className="mt-3">
          <div className="inline-flex rounded-lg ring-1 ring-slate-200 p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                mode === "upload"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Upload file
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                mode === "url"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Paste link
            </button>
          </div>

          {mode === "url" && (
            <div className="mt-2 flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addByUrl();
                  }
                }}
                placeholder="https://images.unsplash.com/..."
                className="input flex-1"
              />
              <button
                type="button"
                onClick={addByUrl}
                disabled={!urlInput.trim()}
                className="btn-primary whitespace-nowrap"
              >
                Add link
              </button>
            </div>
          )}
        </div>
      )}

      <p className="mt-2 text-xs text-slate-500">
        JPG, PNG, WEBP or GIF · max 5 MB each
        {multiple && ` · up to ${max} images`} · or paste an image URL
      </p>
    </div>
  );
}
