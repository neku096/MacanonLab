"use client";

import { useRef, useState } from "react";
import styles from "./AdminProductsClient.module.css";

const FILE_API = "/api/admin/files";
const ALLOWED_EXTENSIONS = new Set(["webp", "png", "jpg", "jpeg"]);

export default function AdminFilePathInput({ value = "", onChange, targetDir, placeholder }) {
  const inputRef = useRef(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPath, setPendingPath] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setUploading] = useState(false);

  const extension = getExtension(pendingFile?.name || value);
  const showWebpWarning = extension && extension !== "webp";

  function openPicker() {
    inputRef.current?.click();
  }

  function prepareFile(file) {
    setMessage("");
    setError("");
    if (!file) return;
    if (!isSupportedImage(file.name)) {
      setPendingFile(null);
      setPendingPath("");
      setError("WebP / PNG / JPG / JPEG のみ対応しています。");
      return;
    }
    const nextPath = buildTargetPath(targetDir, file.name, value);
    setPendingFile(file);
    setPendingPath(nextPath);
    setMessage(`保存先: public${nextPath}`);
  }

  async function uploadPendingFile(overwrite = false) {
    if (!pendingFile || !pendingPath) return;
    setUploading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.set("file", pendingFile);
      formData.set("targetPath", pendingPath);
      formData.set("overwrite", overwrite ? "true" : "false");

      const response = await fetch(FILE_API, { method: "POST", body: formData });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 409 && payload.conflict) {
        const shouldOverwrite = window.confirm(`既存ファイルを上書きしますか？\npublic${pendingPath}`);
        if (shouldOverwrite) {
          await uploadPendingFile(true);
        } else {
          setMessage("上書きをキャンセルしました。");
        }
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || "画像ファイルのコピーに失敗しました。");
      }

      onChange?.(payload.path || pendingPath);
      setPendingFile(null);
      setPendingPath("");
      setMessage(payload.overwritten ? "上書きしてパスを反映しました。" : "コピーしてパスを反映しました。");
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    prepareFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className={styles.filePathInput} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
      <div className={styles.filePathRow}>
        <input value={value} placeholder={placeholder} onChange={(event) => onChange?.(event.target.value)} />
        <button className={styles.smallButton} type="button" onClick={openPicker}>
          参照
        </button>
        <input
          ref={inputRef}
          className={styles.hiddenFileInput}
          type="file"
          accept=".webp,.png,.jpg,.jpeg,image/webp,image/png,image/jpeg"
          onChange={(event) => prepareFile(event.target.files?.[0])}
        />
      </div>
      <small className={styles.fieldHint}>画像をドラッグ&ドロップできます。コピー前に保存先を確認します。</small>
      {pendingPath ? (
        <div className={styles.filePendingBox}>
          <span>保存先: public{pendingPath}</span>
          {showWebpWarning ? <em>WebP推奨です。</em> : null}
          <button className={styles.smallButton} type="button" onClick={() => uploadPendingFile()} disabled={isUploading}>
            {isUploading ? "コピー中..." : "コピーして反映"}
          </button>
        </div>
      ) : null}
      {message ? <small className={styles.successText}>{message}</small> : null}
      {error ? <small className={styles.errorText}>{error}</small> : null}
    </div>
  );
}

function buildTargetPath(targetDir = "/", fileName = "", currentValue = "") {
  const sanitizedName = sanitizeFileName(fileName);
  if (currentValue && isSupportedImage(currentValue)) {
    return currentValue;
  }
  const normalizedDir = `/${String(targetDir || "/").replace(/^\/+|\/+$/g, "")}`;
  return `${normalizedDir}/${sanitizedName}`;
}

function sanitizeFileName(fileName) {
  const fallback = "image.webp";
  const safeName = String(fileName || fallback)
    .replace(/[\\/:*?"<>|#%{}^~[\]`]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return safeName || fallback;
}

function getExtension(filePath = "") {
  const match = String(filePath).toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] || "";
}

function isSupportedImage(filePath = "") {
  return ALLOWED_EXTENSIONS.has(getExtension(filePath));
}
