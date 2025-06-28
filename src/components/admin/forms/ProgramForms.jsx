import React, { useState, useEffect } from 'react'
import "@/styles/Forms.css"
import axios from 'axios'
import Cookies from 'js-cookie'
import { createClient } from '@/utils/supabase/client'

const SUPABASE_PROGRAMS_BUCKET = 'programs-images'

// ---------- ФОРМА ПРОГРАММЫ ----------
const ProgramForm = (props) => {
    const { category, data } = props
    const [categories, setCategories] = useState([])
    const [image, setImage] = useState(null)
    const [formData, setFormData] = useState({
        category_id: category.id,
        name: data?.name ?? '',
        description: data?.description ?? '',
        type: data?.type ?? '',
        number_of_lessons: data?.number_of_lessons ?? '',
        lesson_duration: data?.lesson_duration ?? '',
        course_duration: data?.course_duration ?? '',
        course_price: data?.course_price ?? '',
        image_path: data?.image_path ?? ''
    })

    const [imagePreview, setImagePreview] = useState('/placeholder.png')

    // Динамически получаем ссылку из Supabase Storage по image_path
    useEffect(() => {
        async function fetchImage() {
            if (formData.image_path) {
                const supabase = createClient()
                const { data } = supabase
                    .storage
                    .from(SUPABASE_PROGRAMS_BUCKET)
                    .getPublicUrl(formData.image_path)
                if (data?.publicUrl) {
                    setImagePreview(data.publicUrl)
                } else {
                    setImagePreview('/placeholder.png')
                }
            } else {
                setImagePreview('/placeholder.png')
            }
        }
        fetchImage()
    }, [formData.image_path])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/programs-categories')
                setCategories(response.data)
            } catch (error) {
                console.error('Error:', error)
            }
        }
        fetchCategories()
    }, [])

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setImagePreview(reader.result)
            reader.readAsDataURL(file)
            setImage(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const dataF = new FormData()
        dataF.append('categoryId', formData.category_id)
        dataF.append('name', formData.name)
        dataF.append('description', formData.description)
        dataF.append('type', formData.type)
        dataF.append('numberOfLessons', formData.number_of_lessons)
        dataF.append('lessonDuration', formData.lesson_duration)
        dataF.append('courseDuration', formData.course_duration)
        dataF.append('coursePrice', formData.course_price)
        dataF.append('image', image)
        dataF.append('imagePath', formData.image_path)

        try {
            const headers = {
                "Authorization": "Bearer " + Cookies.get('token'),
                "Content-Type": "multipart/form-data",
            }
            if (!data) {
                await axios.post('/api/programs-categories/programs', dataF, { headers })
            } else {
                await axios.put(`/api/programs-categories/programs/${data.id}`, dataF, { headers })
            }
            window.location.reload()
        } catch (error) {
            console.error('Error:', error)
        }
    }

    return (
        <div className="form">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Назва програми</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Опис</label>
                    <textarea
                        name="description"
                        id="description"
                        cols="30" rows="10"
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="category_id">Категорія</label>
                    <select name="category_id" id="category_id" onChange={handleInputChange} value={formData.category_id}>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.category_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="type">Вид</label>
                    <input
                        type="text"
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="number_of_lessons">Кількість занять</label>
                    <input
                        type="text"
                        id="number_of_lessons"
                        name="number_of_lessons"
                        value={formData.number_of_lessons}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="lesson_duration">Тривалість уроку</label>
                    <input
                        type="text"
                        id="lesson_duration"
                        name="lesson_duration"
                        value={formData.lesson_duration}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="course_duration">Тривалість курсу</label>
                    <input
                        type="text"
                        id="course_duration"
                        name="course_duration"
                        value={formData.course_duration}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="course_price">Вартість курсу</label>
                    <input
                        type="text"
                        id="course_price"
                        name="course_price"
                        value={formData.course_price}
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
                    /><br />
                    <img src={imagePreview} style={{ width: "50%" }} alt="Відсутня картинка" />
                </div>
                <button type="submit">{data ? "Редагувати програму" : "Додати програму"}</button>
            </form>
        </div>
    )
}

// ---------- УДАЛЕНИЕ ПРОГРАММЫ ----------
const ProgramDeleteForm = (props) => {
    const {categoryId, program} = props

    const handleDeleteSubmit = async (e) => {
        e.preventDefault()
        try {
            await axios.delete(`/api/programs-categories/programs/${program.id}`, {
                data: { categoryId: categoryId },
                headers: {
                    Authorization: `Bearer ${Cookies.get('token')}`,
                    "Content-Type": "multipart/form-data",
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
                <p style={{ fontFamily: 'sans-serif' }}>Ви впевнені, що хочете видалити <b>{program.name}</b></p>
                <button className="submit delete" type="submit">Так, видалити</button>
            </form>
        </div>
    )
}

// ---------- ФОРМА КАТЕГОРИИ ----------
const ProgramCategoryForm = (props) => {
    const {category} = props;
    const [image, setImage] = useState(null);
    const [formData, setFormData] = useState({
        category_name: category?.category_name ?? '',
        description: category?.description ?? '',
        image_path: category?.image_path ?? ''
    })

    const [imagePreview, setImagePreview] = useState('/placeholder.png');

    useEffect(() => {
        async function fetchImage() {
            if (formData.image_path) {
                const supabase = createClient()
                const { data } = supabase
                    .storage
                    .from(SUPABASE_PROGRAMS_BUCKET)
                    .getPublicUrl(formData.image_path)
                if (data?.publicUrl) {
                    setImagePreview(data.publicUrl)
                } else {
                    setImagePreview('/placeholder.png')
                }
            } else {
                setImagePreview('/placeholder.png')
            }
        }
        fetchImage()
    }, [formData.image_path])

    const handleCategoryInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setImage(file)
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault()
        const formDataRes = new FormData()
        formDataRes.append("categoryName", formData.category_name)
        formDataRes.append("description", formData.description)
        formDataRes.append("image", image)
        formDataRes.append("imagePath", formData.image_path)

        try {
            const headers = {
                "Authorization": "Bearer " + Cookies.get('token'),
                "Content-Type": "multipart/form-data",
            }
            if (!props.category) {
                await axios.post('/api/programs-categories', formDataRes, { headers })
            } else {
                await axios.put(`/api/programs-categories/${props.category.id}`, formDataRes, { headers })
            }
            window.location.reload()
        } catch (error) {
            console.error('Error:', error)
        }
    }

    return (
        <div className="form">
            <form onSubmit={handleCategorySubmit}>
                <div className="form-group">
                    <label htmlFor="category_name">Назва категорії</label>
                    <input
                        type="text"
                        id="category_name"
                        name="category_name"
                        value={formData.category_name}
                        onChange={handleCategoryInputChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Опис</label>
                    <textarea
                        name="description"
                        id="description"
                        cols="30" rows="10"
                        value={formData.description}
                        onChange={handleCategoryInputChange}
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
                    <img src={imagePreview} style={{width: "50%"}} alt="Відсутня картинка" />
                </div>
                <button className="submit" type="submit">{props.category ? "Редагувати категорію" : "Додати категорію"}</button>
            </form>
        </div>
    )
}

// ---------- УДАЛЕНИЕ КАТЕГОРИИ ----------
const ProgramCategoryDeleteForm = (props) => {
    const { category } = props

    const handleDeleteSubmit = async (e) => {
        e.preventDefault()
        try {
            await axios.delete(`/api/programs-categories/${props.category.id}`, {
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
                <p style={{ fontFamily: 'sans-serif' }}>Ви впевнені, що хочете видалити <b>{category.category_name}</b></p>
                <button className="submit delete" type="submit">Так, видалити</button>
            </form>
        </div>
    )
}

export {
    ProgramCategoryForm,
    ProgramForm,
    ProgramDeleteForm,
    ProgramCategoryDeleteForm,
}
