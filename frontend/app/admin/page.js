"use client";
import React, { useState, useEffect, useRef } from "react";
import {
    Database,
    BrainCircuit,
    Image as ImageIcon,
    Send,
    Upload,
    PlusCircle,
    Loader2,
    FileText,
    Activity,
    Edit2,
    Trash2,
    X
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("items");

    return (
        <div className="flex h-screen bg-neutral-950 text-neutral-100 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-neutral-900/50 backdrop-blur-xl border-r border-neutral-800/60 p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                            Nexus AI
                        </h1>
                    </div>

                    <nav className="space-y-2">
                        <NavItem
                            icon={<Database />}
                            label="Database Items"
                            active={activeTab === "items"}
                            onClick={() => setActiveTab("items")}
                        />
                        <NavItem
                            icon={<BrainCircuit />}
                            label="AI Assistant"
                            active={activeTab === "ai"}
                            onClick={() => setActiveTab("ai")}
                        />
                        <NavItem
                            icon={<ImageIcon />}
                            label="OCR Analysis"
                            active={activeTab === "ocr"}
                            onClick={() => setActiveTab("ocr")}
                        />
                    </nav>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20">
                    <p className="text-xs text-indigo-200/70 text-center">
                        Nexus AI Hackathon System <br /> v1.0.0
                    </p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-y-auto">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>

                <div className="p-10 max-w-6xl mx-auto min-h-full">
                    {activeTab === "items" && <ItemsView />}
                    {activeTab === "ai" && <AIView />}
                    {activeTab === "ocr" && <OCRView />}
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ease-out group ${active
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5"
                    : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 border border-transparent"
                }`}
        >
            <div className={`transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`}>
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <span className="font-medium tracking-wide text-sm">{label}</span>
        </button>
    );
}

// --- Views ---

function ItemsView() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/items/`);
            const data = await res.json();
            setItems(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmitItem = async (e) => {
        e.preventDefault();
        if (!name) return;
        setIsSubmitting(true);
        try {
            let newItemId;
            if (editingItem) {
                await fetch(`${API_BASE_URL}/items/${editingItem.id}/`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, description }),
                });
                newItemId = editingItem.id;
            } else {
                const res = await fetch(`${API_BASE_URL}/items/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, description }),
                });
                const newItem = await res.json();
                newItemId = newItem.id;
            }

            if ((imageFile || removeImage) && editingItem && editingItem.images && editingItem.images.length > 0) {
                for (const img of editingItem.images) {
                    await fetch(`${API_BASE_URL}/item-images/${img.id}/`, { method: "DELETE" });
                }
            }

            if (imageFile && newItemId) {
                const formData = new FormData();
                formData.append("item", newItemId);
                formData.append("image", imageFile);
                await fetch(`${API_BASE_URL}/item-images/`, {
                    method: "POST",
                    body: formData,
                });
            }

            handleCancelEdit();
            fetchItems();
        } catch (e) {
            console.error(e);
        }
        setIsSubmitting(false);
    };

    const handleDeleteItem = async (id) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            await fetch(`${API_BASE_URL}/items/${id}/`, {
                method: "DELETE",
            });
            fetchItems();
        } catch (e) {
            console.error(e);
        }
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        setName(item.name);
        setDescription(item.description);
        setImageFile(null);
        setRemoveImage(false);
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setName("");
        setDescription("");
        setImageFile(null);
        setRemoveImage(false);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-10">
                <h2 className="text-4xl font-bold tracking-tight text-white mb-2">Database Items</h2>
                <p className="text-neutral-400 text-lg">Manage your application entities stored in the backend.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center p-20">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="p-10 border border-neutral-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-neutral-500 bg-neutral-900/20 backdrop-blur-sm">
                            <Database className="w-12 h-12 mb-4 opacity-50" />
                            <p>No items found. Create one to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {items.map((item) => (
                                <div key={item.id} className="group relative p-6 bg-neutral-900/40 backdrop-blur-md border border-neutral-800 rounded-2xl hover:border-indigo-500/50 hover:bg-neutral-800/60 transition-all duration-300 overflow-hidden flex flex-col">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>

                                    <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button onClick={() => handleEditClick(item)} className="p-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-colors backdrop-blur-md">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteItem(item.id)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors backdrop-blur-md">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {item.images && item.images.length > 0 && (
                                        <div className="w-full h-40 mb-5 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800/50">
                                            <img
                                                src={item.images[0].image.startsWith('http') ? item.images[0].image : `http://127.0.0.1:8000${item.images[0].image}`}
                                                alt={item.name}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                    )}

                                    <h3 className="text-xl font-semibold text-neutral-100 mb-2 pr-16">{item.name}</h3>
                                    <p className="text-neutral-400 text-sm mb-4 line-clamp-3 flex-1">{item.description || "No description provided."}</p>
                                    <p className="text-xs text-neutral-600 font-mono">ID: {item.id} • {new Date(item.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <div className="sticky top-10 p-6 bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-xl">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            {editingItem ? <Edit2 className="w-5 h-5 text-indigo-400" /> : <PlusCircle className="w-5 h-5 text-indigo-400" />}
                            {editingItem ? "Edit Item" : "Add New Item"}
                        </h3>
                        <form onSubmit={handleSubmitItem} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-700"
                                    placeholder="Item Name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all min-h-[120px] resize-none placeholder:text-neutral-700"
                                    placeholder="Detailed description..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Image (Optional)</label>
                                {editingItem && editingItem.images && editingItem.images.length > 0 && !removeImage && !imageFile && (
                                    <div className="mb-3 relative group rounded-xl overflow-hidden border border-neutral-800">
                                        <img
                                            src={editingItem.images[0].image.startsWith('http') ? editingItem.images[0].image : `http://127.0.0.1:8000${editingItem.images[0].image}`}
                                            alt="Current"
                                            className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setRemoveImage(true)}
                                            className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-lg backdrop-blur-sm transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                {imageFile && (
                                    <div className="mb-3 relative group rounded-xl overflow-hidden border border-neutral-800">
                                        <img
                                            src={URL.createObjectURL(imageFile)}
                                            alt="Preview"
                                            className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setImageFile(null); setRemoveImage(true); }}
                                            className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-lg backdrop-blur-sm transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                {!imageFile && (
                                    <input
                                        key={imageFile ? "has-file" : "no-file"}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => { setImageFile(e.target.files[0]); setRemoveImage(false); }}
                                        className="w-full text-sm text-neutral-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer bg-neutral-950 border border-neutral-800 rounded-xl transition-all"
                                    />
                                )}
                            </div>
                            <div className="flex gap-3 pt-2">
                                {editingItem && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <X className="w-5 h-5" /> Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={!name || isSubmitting}
                                    className={`flex-[2] text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20`}
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingItem ? "Update Item" : "Create Item")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AIView() {
    const [prompt, setPrompt] = useState("");
    const [context, setContext] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!prompt) return;
        setLoading(true);
        setResponse("");
        try {
            const res = await fetch(`${API_BASE_URL}/analyze/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, context }),
            });
            const data = await res.json();
            if (data.success) {
                setResponse(data.data);
            } else {
                setResponse("Error: " + (data.error || JSON.stringify(data)));
            }
        } catch (e) {
            setResponse("Network Error: " + e.message);
        }
        setLoading(false);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
            <header className="mb-10 text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20 border border-white/10 rotate-3">
                    <BrainCircuit className="w-10 h-10 text-white -rotate-3" />
                </div>
                <h2 className="text-4xl font-bold tracking-tight text-white mb-4">Gemini AI Assistant</h2>
                <p className="text-neutral-400 text-lg">Power your workflows with advanced reasoning and analysis.</p>
            </header>

            <div className="space-y-6 bg-neutral-900/40 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-2 ml-1">Context (Optional)</label>
                        <textarea
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="Provide any background information or data here..."
                            className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl px-5 py-4 text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all min-h-[100px] resize-y placeholder:text-neutral-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-2 ml-1">Prompt</label>
                        <div className="relative">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="What would you like me to do?"
                                className="w-full bg-neutral-950/80 border border-neutral-800 rounded-2xl pl-5 pr-16 py-4 text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all min-h-[140px] resize-y placeholder:text-neutral-700 text-lg"
                            />
                            <button
                                onClick={handleAnalyze}
                                disabled={!prompt || loading}
                                className="absolute bottom-4 right-4 p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="mt-8 pt-8 border-t border-neutral-800 animate-in fade-in zoom-in-95 duration-500">
                        <h3 className="text-lg font-semibold text-indigo-400 mb-4 flex items-center gap-2">
                            <div className="relative flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <BrainCircuit className="relative inline-flex rounded-full w-5 h-5" />
                            </div>
                            Synthesizing response...
                        </h3>
                        <div className="bg-neutral-950/50 p-6 rounded-2xl border border-neutral-800/50 space-y-4">
                            <div className="h-3 bg-neutral-800/70 rounded-full w-3/4 animate-pulse"></div>
                            <div className="h-3 bg-neutral-800/70 rounded-full w-full animate-pulse delay-75"></div>
                            <div className="h-3 bg-neutral-800/70 rounded-full w-5/6 animate-pulse delay-150"></div>
                            <div className="h-3 bg-neutral-800/70 rounded-full w-1/2 animate-pulse delay-200"></div>
                        </div>
                    </div>
                )}

                {response && !loading && (
                    <div className="mt-8 pt-8 border-t border-neutral-800 animate-in fade-in zoom-in-95 duration-500">
                        <h3 className="text-lg font-semibold text-indigo-400 mb-4 flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5" /> AI Response
                        </h3>
                        <div className="bg-neutral-950/50 p-6 rounded-2xl border border-indigo-500/20 text-neutral-200 leading-relaxed whitespace-pre-wrap shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                            {response}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function OCRView() {
    const [file, setFile] = useState(null);
    const [prompt, setPrompt] = useState("Analyze and summarize the text found in this image.");
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selected);
            setResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("image", file);
        formData.append("prompt", prompt);

        try {
            const res = await fetch(`${API_BASE_URL}/ocr/`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setResult(data);
            } else {
                setResult({ error: data.error || JSON.stringify(data) });
            }
        } catch (e) {
            setResult({ error: "Network Error: " + e.message });
        }
        setLoading(false);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
            <header className="mb-10 text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-teal-500/20 border border-white/10 -rotate-3">
                    <ImageIcon className="w-10 h-10 text-white rotate-3" />
                </div>
                <h2 className="text-4xl font-bold tracking-tight text-white mb-4">OCR & Vision Analysis</h2>
                <p className="text-neutral-400 text-lg">Extract text from images and analyze it instantly using Gemini Vision.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group cursor-pointer bg-neutral-900/40 backdrop-blur-xl border-2 border-neutral-800 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:border-teal-500/50 hover:bg-neutral-800/40 transition-all duration-300 min-h-[300px] relative overflow-hidden"
                    >
                        {preview ? (
                            <div className="absolute inset-0 p-4">
                                <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-2xl" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-white font-medium flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full"><Upload className="w-4 h-4" /> Change Image</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-teal-500/20 group-hover:text-teal-400">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-semibold text-neutral-200 mb-2">Upload Image</h3>
                                <p className="text-neutral-500 text-sm max-w-[200px]">Drag and drop an image or click to browse files</p>
                            </>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 shadow-xl">
                        <label className="block text-sm font-medium text-neutral-400 mb-3 ml-1">Analysis Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-neutral-950/80 border border-neutral-800 rounded-2xl px-5 py-4 text-neutral-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all min-h-[100px] resize-y placeholder:text-neutral-700"
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={!file || loading}
                            className="w-full mt-4 bg-teal-600 hover:bg-teal-500 text-white font-medium py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                            {loading ? "Processing Vision & OCR..." : "Analyze Image"}
                        </button>
                    </div>
                </div>

                <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-xl flex flex-col min-h-[500px]">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-teal-400 pb-4 border-b border-neutral-800/50">
                        <FileText className="w-5 h-5" /> Analysis Results
                    </h3>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {!result && !loading && (
                            <div className="h-full flex flex-col items-center justify-center text-neutral-500 opacity-50">
                                <FileText className="w-16 h-16 mb-4" />
                                <p>Upload an image and run analysis to see results here.</p>
                            </div>
                        )}

                        {loading && (
                            <div className="h-full flex flex-col items-center justify-center text-teal-400 space-y-6 animate-in zoom-in duration-500">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-teal-500/30 blur-2xl rounded-full animate-pulse"></div>
                                    <BrainCircuit className="w-16 h-16 relative z-10 animate-bounce" />
                                </div>
                                <div className="space-y-2 text-center">
                                    <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400 animate-pulse">
                                        Processing Vision Data...
                                    </p>
                                    <p className="text-sm text-neutral-400">Extracting text & generating insights</p>
                                </div>
                                <div className="w-full max-w-[200px] space-y-2 mt-4">
                                    <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-teal-500 w-1/2 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.8)] animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {result && result.error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-red-500/20 rounded-lg"><Activity className="w-5 h-5" /></div>
                                <p className="font-medium">{result.error}</p>
                            </div>
                        )}

                        {result && result.success && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-neutral-800 to-neutral-700 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                                    <div className="relative bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-6">
                                        <h4 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4 flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Raw Extracted Text
                                        </h4>
                                        <div className="p-4 bg-neutral-900/50 rounded-xl text-neutral-300 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar border border-neutral-800/50">
                                            {result.extracted_text}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                    <div className="relative bg-teal-950/20 border border-teal-500/30 rounded-2xl p-7 shadow-2xl">
                                        <h4 className="text-sm uppercase tracking-widest text-teal-400 font-bold mb-5 flex items-center gap-3">
                                            <div className="p-1.5 bg-teal-500/20 rounded-lg">
                                                <BrainCircuit className="w-5 h-5 text-teal-300" />
                                            </div>
                                            AI Vision Insights
                                        </h4>
                                        <div className="text-neutral-100 leading-loose whitespace-pre-wrap font-medium text-base">
                                            {result.ai_analysis}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
