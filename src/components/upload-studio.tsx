"use client";

import { upload } from "@vercel/blob/client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Check, CloudUpload, Edit3, FileImage, LoaderCircle, RefreshCw, Trash2, X } from "lucide-react";

const collections = ["carousel", "housing", "land", "painting"] as const;
type Collection = (typeof collections)[number];
type StackStatus = "available" | "sold" | "rented" | "ongoing" | "done";
type Asset = { id: string; url: string; name: string; size?: number };
type MediaStack = { id: string; collection: Collection; title: string; location: string; description: string; status: StackStatus; assets: Asset[] };

export function UploadStudio() {
  const [collection, setCollection] = useState<Collection>("carousel");
  const [stacks, setStacks] = useState<MediaStack[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [stackStatus, setStackStatus] = useState<StackStatus>("available");
  const [editingStack, setEditingStack] = useState<MediaStack | null>(null);
  const [removeAssetIds, setRemoveAssetIds] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function loadStacks(target = collection) {
    return fetch(`/api/upload?collection=${target}`).then((response) => response.json()).then((result) => setStacks(result.stacks ?? []));
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/upload?collection=${collection}`).then((response) => response.json()).then((result) => { if (!cancelled) setStacks(result.stacks ?? []); }).catch(() => { if (!cancelled) setStatus("Media could not be loaded."); });
    return () => { cancelled = true; };
  }, [collection]);

  function chooseCollection(target: Collection) {
    setCollection(target); setStatus(""); setFiles(null); setTitle(""); setLocation(""); setDescription(""); setStackStatus("available"); setEditingStack(null); setRemoveAssetIds([]); setProgress(0);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!editingStack && !files?.length) return setStatus("Choose at least one image or video first.");
    if (collection !== "carousel" && !title.trim()) return setStatus("Add a title for this listing.");
    setBusy(true); setProgress(0); setStatus("");
    const form = new FormData();
    form.append("collection", collection); form.append("title", title || "Featured image"); form.append("location", location); form.append("description", description); form.append("status", stackStatus);
    if (editingStack) { form.append("stackId", editingStack.id); form.append("removeAssetIds", JSON.stringify(removeAssetIds)); }
    try {
      const configResponse = await fetch("/api/upload");
      const config = await readUploadResponse(configResponse);
      const selectedFiles = Array.from(files ?? []);
      if (config.storage === "vercel-blob") {
        const uploadedPaths: string[] = [];
        const totalBytes = selectedFiles.reduce((total, file) => total + file.size, 0);
        let completedBytes = 0;
        for (const file of selectedFiles) {
          const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/\.\./g, "-");
          const blob = await upload(`${collection}/direct/${crypto.randomUUID()}/${name}`, file, {
            access: "private",
            handleUploadUrl: "/api/upload/token",
            multipart: true,
            onUploadProgress: ({ loaded }) => setProgress(totalBytes ? Math.min(99, Math.round(((completedBytes + loaded) / totalBytes) * 100)) : 0),
          });
          uploadedPaths.push(blob.pathname);
          completedBytes += file.size;
        }
        form.append("uploadedPaths", JSON.stringify(uploadedPaths));
      } else {
        selectedFiles.forEach((file) => form.append("files", file));
      }
      const response = await fetch("/api/upload", { method: editingStack ? "PATCH" : "POST", body: form });
      const result = await readUploadResponse(response);
      setProgress(100);
      setStatus(editingStack ? "Stack updated successfully." : `${result.stack?.assets.length ?? 0} media item${result.stack?.assets.length === 1 ? "" : "s"} stored in a new stack.`);
      resetForm();
      await loadStacks().catch(() => undefined);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed. Check the server connection.");
    } finally {
      setBusy(false);
    }
  }

  function resetForm() {
    setFiles(null); setTitle(""); setLocation(""); setDescription(""); setStackStatus("available"); setEditingStack(null); setRemoveAssetIds([]); if (inputRef.current) inputRef.current.value = "";
  }

  function editStack(stack: MediaStack) {
    setEditingStack(stack); setTitle(stack.title); setLocation(stack.location); setDescription(stack.description); setStackStatus(stack.status); setRemoveAssetIds([]); setStatus(""); window.scrollTo({ top: 360, behavior: "smooth" });
  }

  async function deleteStack(stack: MediaStack) {
    if (!window.confirm(`Delete the entire ${stack.title} stack and its ${stack.assets.length} media item${stack.assets.length === 1 ? "" : "s"}?`)) return;
    const response = await fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stackId: stack.id }) });
    const result = await response.json(); setStatus(response.ok ? "Stack deleted." : result.error ?? "Delete failed."); if (response.ok) setStacks((current) => current.filter((item) => item.id !== stack.id));
  }

  async function moveStack(stack: MediaStack, target: Collection) {
    if (target === collection) return;
    const response = await fetch("/api/upload", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stackId: stack.id, collection: target }) });
    const result = await response.json(); setStatus(response.ok ? `Stack moved to ${target}.` : result.error ?? "Move failed."); if (response.ok) setStacks((current) => current.filter((item) => item.id !== stack.id));
  }

  return <section className="studio-panel container">
    <div className="media-manager-head"><div><p className="eyebrow">Media library</p><h2>One workspace.<br /><em>Every stack.</em></h2></div><button className="icon-button" type="button" onClick={() => loadStacks().catch(() => setStatus("Media could not be refreshed."))} aria-label="Refresh media library"><RefreshCw size={18} /></button></div>
    <div className="media-tabs" role="tablist" aria-label="Media collections">{collections.map((item) => <button key={item} className={item === collection ? "media-tab active" : "media-tab"} type="button" role="tab" aria-selected={item === collection} onClick={() => chooseCollection(item)}>{item}</button>)}</div>
    <form className="manager-upload" onSubmit={submit}>
      <label className="file-drop"><input ref={inputRef} type="file" accept={collection === "carousel" ? "image/*" : "image/*,video/*"} multiple onChange={(event: ChangeEvent<HTMLInputElement>) => setFiles(event.target.files)} /><CloudUpload size={30} /><strong>{files?.length ? `${files.length} files selected` : `Add ${collection === "carousel" ? "images" : "media"} to ${collection}`}</strong><span>{collection === "carousel" ? "Images only · multiple slides supported" : "Images and videos · multiple files become one stack"}</span></label>
      {collection === "carousel" ? <div className="carousel-upload-panel"><div className="edit-form-heading">{editingStack ? <><span>Editing: {editingStack.title}</span><button className="inline-cancel" type="button" onClick={resetForm}><X size={15} /> Cancel</button></> : <span>Carousel images only</span>}</div>{editingStack && <ExistingAssets stack={editingStack} removeAssetIds={removeAssetIds} setRemoveAssetIds={setRemoveAssetIds} />}{busy && <Progress progress={progress} label="carousel" />}<button disabled={busy} type="submit">{busy ? <LoaderCircle className="spin" size={17} /> : <CloudUpload size={17} />} {busy ? "Saving" : editingStack ? "Save carousel images" : "Upload carousel images"}</button></div> : <div className="stack-fields"><div className="edit-form-heading">{editingStack ? <><span>Editing: {editingStack.title}</span><button className="inline-cancel" type="button" onClick={resetForm}><X size={15} /> Cancel</button></> : <span>New {collection} stack</span>}</div><label>Stack title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Property or service name" /></label><label>Location<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Wa, Ghana" /></label><label>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Add useful details for visitors" /></label><label>Status<select value={stackStatus} onChange={(event) => setStackStatus(event.target.value as StackStatus)}><option value="available">Available</option>{collection === "housing" && <option value="rented">Rented</option>}{collection === "land" && <option value="sold">Sold</option>}{collection === "painting" && <><option value="ongoing">Ongoing</option><option value="done">Done</option></>}</select></label>{editingStack && <ExistingAssets stack={editingStack} removeAssetIds={removeAssetIds} setRemoveAssetIds={setRemoveAssetIds} />}{busy && <Progress progress={progress} label={collection} />}<button disabled={busy} type="submit">{busy ? <LoaderCircle className="spin" size={17} /> : <CloudUpload size={17} />} {busy ? "Saving" : editingStack ? "Save edits" : "Create stack"}</button></div>}
      {status && <p className="upload-status"><Check size={17} /> {status}</p>}
    </form>
    <div className="library-heading"><div><p className="eyebrow">{collection} stacks</p><span>{stacks.length} organized stack{stacks.length === 1 ? "" : "s"}</span></div><span className="storage-badge">CRUD enabled</span></div>
    {stacks.length ? <div className="stack-manager-grid">{stacks.map((stack) => <article className="stack-manager-card" key={stack.id}><div className="stack-manager-cover" style={{ backgroundImage: `url(${stack.assets[0]?.url})` }}><span>{stack.assets.length} media</span></div><div className="stack-manager-body"><p className="eyebrow">{stack.location || "Location not set"}</p><strong>{stack.title}</strong><small>{stack.description || "No description added."}</small>{collection !== "carousel" && <span className={`stack-status ${stack.status}`}>{stack.status}</span>}<div className="stack-manager-actions"><select value={collection} onChange={(event) => moveStack(stack, event.target.value as Collection)} aria-label={`Move ${stack.title}`}><option value={collection}>Move to...</option>{collections.filter((target) => target !== collection).map((target) => <option key={target} value={target}>{target}</option>)}</select><button className="edit-button" type="button" onClick={() => editStack(stack)}><Edit3 size={15} /> EDIT</button><button className="danger-button" type="button" onClick={() => deleteStack(stack)}><Trash2 size={15} /> DELETE</button></div></div></article>)}</div> : <div className="library-empty"><FileImage size={24} /><strong>No stacks in {collection} yet</strong><span>Upload above to create the first one.</span></div>}
    <div className="studio-note"><Check size={20} /><p><strong>Connected to the frontend.</strong><br />Every stack is isolated by collection and updates the public feed.</p></div>
  </section>;
}

function Progress({ progress, label }: { progress: number; label: string }) { return <div className="progress-wrap" aria-live="polite"><div className="progress-label"><span>Saving {label}</span><strong>{progress}%</strong></div><div className="progress-track"><div className="progress-value" style={{ width: `${progress}%` }} /></div></div>; }
function ExistingAssets({ stack, removeAssetIds, setRemoveAssetIds }: { stack: MediaStack; removeAssetIds: string[]; setRemoveAssetIds: (ids: string[]) => void }) { return <div className="edit-assets"><span>Existing media</span>{stack.assets.map((asset) => <label key={asset.id} className={removeAssetIds.includes(asset.id) ? "edit-asset removed" : "edit-asset"}><input type="checkbox" checked={removeAssetIds.includes(asset.id)} onChange={() => setRemoveAssetIds(removeAssetIds.includes(asset.id) ? removeAssetIds.filter((id) => id !== asset.id) : [...removeAssetIds, asset.id])} /><span style={{ backgroundImage: `url(${asset.url})` }} /><small>{removeAssetIds.includes(asset.id) ? "Remove" : asset.name}</small></label>)}</div>; }

async function readUploadResponse(response: Response): Promise<{ storage?: string; stack?: MediaStack; error?: string }> {
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.error ?? (response.status === 413 ? "The upload exceeded the server request limit. Refresh the page and try again." : `Upload failed (HTTP ${response.status}). Please try again.`));
  }
  if (!result) throw new Error("The upload service returned an invalid response. Please try again.");
  return result;
}
