import React, { useState, useEffect } from 'react'
import "@/styles/Forms.css"
import axios from 'axios'
import Cookies from 'js-cookie'
import { createClient } from '@/utils/supabase/client'

const NewsForm = ({ initialNewsData }) => {
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState('/placeholder.png')
    const [newsData, setNewsData] = useState({
        name: initialNewsData?.name ?? '',
        short_address: initialNewsData?.short_address ?? '',
        full_address: initialNewsData?.full_address ?? '',
        description: initialNewsData?.description ?? '',
        image_path: initialNewsData?.image_path ?? ''
    })

    useEffect(() => {
        if (initialNewsData) {
            setNewsData(initialNewsData)
        }
    }, [initialNewsData])

    useEffect(() => {
        console.log(initialNewsData)
        console.log('newsData.image_path:', newsData.image_path);

        async function fetchImage() {
            if (newsData.image_path) {
                const supabase = createClient();
                const { data } = supabase
                    .storage
                    .from('news-images')
                    .getPublicUrl(newsData.image_path);

                console.log('publicUrl:', data.publicUrl);

                if (data?.publicUrl) {
                    setImagePreview(data.publicUrl);
                } else {
                    setImagePreview('/placeholder.png');
                }
            } else {
                setImagePreview('/placeholder.png');
            }
        }
        fetchImage();
    }, [newsData.image_path]);


    const handleInputChange = (event) => {
        const { name, value } = event.target
        setNewsData({ ...newsData, [name]: value })
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]

        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
            setImage(file)
        }
    }

    const handleNewsSubmit = async (event) => {
        event.preventDefault()

        const formData = new FormData()
        formData.append("name", newsData.name)
        formData.append("shortAddress", newsData.shortAddress)
        formData.append("fullAddress", newsData.fullAddress)
        formData.append("description", newsData.description)
        formData.append("image", image)
        formData.append("image_path", newsData.image_path)

        try {
            const headers = {
                "Authorization": "Bearer " + Cookies.get('token'),
                "Content-Type": "multipart/form-data",
            }

            if (initialNewsData) {
                await axios.put(`/api/news/${initialNewsData.id}`, formData, { headers })
            } else {
                await axios.post('/api/news/', formData, { headers })
            }

            window.location.reload()
        } catch (error) {
            console.error('Error:', error)
        }
    }

    return (
        <div className="form">
            <form onSubmit={handleNewsSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Назва новини</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={newsData.name}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="shortAddress">Коротка адреса</label>
                    <input
                        type="text"
                        id="shortAddress"
                        name="shortAddress"
                        value={newsData.shortAddress}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="fullAddress">Повна адреса</label>
                    <input
                        type="text"
                        id="fullAddress"
                        name="fullAddress"
                        value={newsData.fullAddress}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Опис</label>
                    <textarea
                        name="description"
                        id="description"
                        cols="30" rows="10"
                        value={newsData.description}
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

                <button className="submit" type="submit">
                    {initialNewsData ? 'Оновити новину' : 'Добавити новину'}
                </button>
            </form>
        </div>
    )
}

const NewsDeleteForm = ({ news }) => {
    const handleDeleteSubmit = async (e) => {
        e.preventDefault()

        try {
            await axios.delete(`/api/news/${news.id}`, {
                headers: {
                    Authorization: `Bearer ${Cookies.get('token')}`,
                },
            })
            window.location.reload()
        } catch (error) {
            console.error('Error:', error.response?.data)
        }
    }

    return (
        <div className="form">
            <form onSubmit={handleDeleteSubmit}>
                <p style={{ fontFamily: 'sans-serif' }}>
                    Ви впевнені, що хочете видалити <b>{news.name}</b>?
                </p>
                <button className="submit delete" type="submit">Так, видалити</button>
            </form>
        </div>
    )
}

export {
    NewsForm,
    NewsDeleteForm
}
