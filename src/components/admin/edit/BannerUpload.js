"use client";
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function BannerUpload() {
    const [status, setStatus] = useState("");
    const [preview, setPreview] = useState("/images/people.jpg");
    const fileInput = useRef();

    useEffect(() => {
        fetch("/api/banner")
            .then(res => res.json())
            .then(data => {
                if (data.bannerImage) {
                    setPreview(`/images/${data.bannerImage}`);
                }
            });
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const file = fileInput.current.files[0];
        if (!file) {
            setStatus("Виберіть файл.");
            return;
        }
        const formData = new FormData();
        formData.append("banner", file);

        setStatus("Завантаження...");

        try {
            const res = await axios.post("/api/banner", formData, {
                headers: {
                    "Authorization": `Bearer ${Cookies.get("token")}`,
                    // Axios сам поставит content-type: multipart/form-data с boundary
                },
            });
            setStatus("Банер оновлено!");
            if (res.data.bannerImage) {
                setPreview(`/images/${res.data.bannerImage}?t=${Date.now()}`);
            }
        } catch (error) {
            setStatus("Помилка при завантаженні.");
            if (error.response && error.response.data && error.response.data.message) {
                setStatus(error.response.data.message);
            }
        }
    };

    return (
        <div>
            <h2>Змінити головний банер</h2>
            <img
                src={preview}
                alt="Banner Preview"
                style={{ width: "100%", maxWidth: 400, borderRadius: 8, marginBottom: 16 }}
            />
            <form onSubmit={handleSubmit}>
                <input type="file" accept="image/*" ref={fileInput} onChange={handleFileChange} />
                <button type="submit" style={{ marginLeft: 8 }}>Завантажити</button>
            </form>
            <div>{status}</div>
        </div>
    );
}
