"use client";
import React, { useState, useEffect } from 'react'
import '@/styles/Partners.css'
import { createClient } from '@/utils/supabase/client'

const SUPABASE_PARTNERS_BUCKET = 'partners-images'
const PLACEHOLDER = '/placeholder.png'

const Partners = () => {
    const [partners, setPartners] = useState([])

    useEffect(() => {
        fetch('/api/partners')
            .then(res => res.json())
            .then(setPartners)
            .catch(console.error)
    }, [])

    return (
        <div className='partners'>
            <h2><b className='partners-title'>Наші партнери</b></h2>
            <div className="partners-container">
                {partners.map((partner) => (
                    <PartnerLogo key={partner.id} partner={partner} />
                ))}
            </div>
        </div>
    )
}

function PartnerLogo({ partner }) {
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
        } else {
            setImgUrl(PLACEHOLDER)
        }
    }, [partner.image_path])

    return (
        <div className="partner-item">
            <a href={partner.url || "#"} target="_blank" rel="noopener noreferrer">
                <img
                    src={imgUrl}
                    alt={`Partner ${partner.id}`}
                    style={{  objectFit: 'contain' }}
                    onError={e => { e.target.src = PLACEHOLDER }}
                />
            </a>
        </div>
    )
}

export default Partners
