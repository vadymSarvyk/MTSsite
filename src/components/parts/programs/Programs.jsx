"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Image from 'next/image';

import { createClient } from '@/utils/supabase/client'

import ProgramsContent from './ProgramsContent';
import '@/styles/Programs.css'

const SUPABASE_PROGRAMS_BUCKET = 'programs-images'
const PLACEHOLDER = "/placeholder.png"

function Category({ category }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [imgUrl, setImgUrl] = useState(PLACEHOLDER)

    useEffect(() => {
        if (category.image_path) {
            const supabase = createClient()
            const { data } = supabase
                .storage
                .from(SUPABASE_PROGRAMS_BUCKET)
                .getPublicUrl(category.image_path)
            if (data?.publicUrl) setImgUrl(data.publicUrl)
            else setImgUrl(PLACEHOLDER)
        } else {
            setImgUrl(PLACEHOLDER)
        }
    }, [category.image_path])

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    return (
        <>
            {isModalOpen && (
                <Dialog maxWidth={'xl'} open={isModalOpen} onClose={closeModal}>
                    <DialogTitle></DialogTitle>
                    <DialogContent>
                        <ProgramsContent programs={category.programs} />
                    </DialogContent>
                </Dialog>
            )}
            <div className="programs-category" onClick={openModal}>
                <div className="programs-category-image">
                    <Image
                        src={imgUrl}
                        alt=""
                        width={350}
                        height={300}
                        layout="responsive"
                        quality={100}
                        onError={(e) => { e.target.src = PLACEHOLDER }}
                    />
                </div>
                <div className="programs-category-body">
                    <h4><b>{category.category_name}</b></h4>
                    {category.description}
                </div>
            </div>
        </>
    )
}

function Programs() {
    const [categories, setCategories] = useState([])

    useEffect(() => {
        axios.get('/api/programs-categories')
            .then(response => setCategories(response.data))
            .catch(error => console.log(error));
    }, []);

    return (
        <div id="programs" className="container-column">
            <h4 className="programs-header"><b>Наші програми</b></h4>
            <p className="programs-description">Для будь-якоі вікової категорії, рівня володіння мовою і поставлених цілей. </p>
            <div className="container-row programs-categories">
                {categories.map((category) => (
                    <Category key={category.id} category={category} />
                ))}
            </div>
        </div>
    )
}

export default Programs
