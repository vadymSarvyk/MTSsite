import React, { useState, useEffect } from 'react'
import "@/styles/Forms.css"
import axios from 'axios';
import Cookies from 'js-cookie';
import { createClient } from '@/utils/supabase/client'

const SUPABASE_PARTNERS_BUCKET = 'partners-images'
const PLACEHOLDER = '/placeholder.png'

const PartnerForm = ({ initialData }) => {
    const [image, setImage] = useState(null);
    const [partnerData, setPartnerData] = useState({
        url: initialData?.url ?? '',
        image_path: initialData?.image_path ?? ''
    })
    const [imagePreview, setImagePreview] = useState(PLACEHOLDER)

    useEffect(() => {
        setPartnerData({
            url: initialData?.url ?? '',
            image_path: initialData?.image_path ?? ''
        });
    }, [initialData]);

    useEffect(() => {
        if (partnerData.image_path) {
            const supabase = createClient()
            const { data } = supabase
                .storage
                .from(SUPABASE_PARTNERS_BUCKET)
                .getPublicUrl(partnerData.image_path)
            if (data?.publicUrl) setImagePreview(data.publicUrl)
            else setImagePreview(PLACEHOLDER)
        } else {
            setImagePreview(PLACEHOLDER)
        }
    }, [partnerData.image_path])

    const handleInputChange = (event) => {
        const { name, value } = event.target
        setPartnerData({ ...partnerData, [name]: value })
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result)
            reader.readAsDataURL(file);
            setImage(file);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault()
        const formData = new FormData()
        formData.append("url", partnerData.url)
        formData.append("image", image)
        formData.append("image_path", partnerData.image_path)

        try {
            if (initialData) {
                await axios.put(`/api/partners/${initialData.id}`, formData, {
                    headers: {
                        "Authorization": "Bearer " + Cookies.get('token'),
                        "Content-Type": "multipart/form-data",
                    }
                })
            } else {
                await axios.post('/api/partners/', formData, {
                    headers: {
                        "Authorization": "Bearer " + Cookies.get('token'),
                        "Content-Type": "multipart/form-data",
                    }
                })
            }
            window.location.reload();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <div className="form">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="url">URL партнера</label>
                    <input
                        type="text"
                        id="url"
                        name="url"
                        value={partnerData.url}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="image">Зображення</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    <img src={imagePreview} style={{ width: "50%" }} alt="Відсутня картинка" />
                </div>
                <button className="submit" type="submit">{initialData ? 'Оновити партнера' : 'Добавити партнера'}</button>
            </form>
        </div>
    )
}

const PartnerDeleteForm = ({ partner }) => {
    const [imgUrl, setImgUrl] = useState(PLACEHOLDER)

    useEffect(() => {
        if (partner.image_path) {
            const supabase = createClient()
            const { data } = supabase
                .storage
                .from(SUPABASE_PARTNERS_BUCKET)
                .getPublicUrl(partner.image_path)
            if (data?.publicUrl) setImgUrl(data.publicUrl)
            else setImgUrl(PLACEHOLDER)
        }
    }, [partner.image_path])

    const handleDeleteSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.delete(`/api/partners/${partner.id}`, {
                headers: {
                    Authorization: `Bearer ${Cookies.get('token')}`,
                },
            });
            window.location.reload()
        } catch (error) {
            console.error('Error:', error.response?.data);
        }
    };

    return (
        <div className="form">
            <form onSubmit={handleDeleteSubmit}>
                <p style={{ fontFamily: 'sans-serif' }}>Ви впевнені, що хочете видалити партнера?</p>
                <img src={imgUrl} style={{ width: "50%" }} alt="" /><br />
                <button className="submit delete" type="submit">Так, видалити</button>
            </form>
        </div>
    )
}

export {
    PartnerForm,
    PartnerDeleteForm
}
