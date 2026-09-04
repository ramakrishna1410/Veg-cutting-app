import React, { useRef, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ImagePlus, Loader2, X } from "lucide-react";
import { storage } from "@/lib/firebase";

interface Props {
  folder: "categories" | "menuItems";
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUploader({ folder, value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const path = `images/${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {value ? (
        <div style={{ position: "relative", width: 96, height: 96 }}>
          <img
            src={value}
            alt=""
            style={{ width: 96, height: 96, borderRadius: 12, objectFit: "cover", border: "1px solid var(--border)" }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="icon-btn"
            style={{ position: "absolute", top: -8, right: -8, width: 26, height: 26, background: "#fff" }}
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            width: 96, height: 96, borderRadius: 12, border: "1.5px dashed var(--border)",
            background: "var(--panel)", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 4, color: "var(--text-muted)",
          }}
        >
          {uploading ? <Loader2 size={18} className="spin" /> : <ImagePlus size={18} />}
          <span style={{ fontSize: 10.5, fontWeight: 600 }}>{uploading ? "Uploading..." : "Add photo"}</span>
        </button>
      )}
      {error && <p style={{ color: "var(--danger)", fontSize: 11.5, marginTop: 6 }}>{error}</p>}
    </div>
  );
}
