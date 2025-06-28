import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'
import '@/styles/EventCard.css';

function EventCard({ event, isExpanded, onExpand }) {
    const [imageUrl, setImageUrl] = useState(null)
    const [imageError, setImageError] = useState(false)

    const handleImageError = () => {
        setImageError(true);
    };

    useEffect(() => {
        const supabase = createClient()
        if (event.image_path) {
            const { data } = supabase
                .storage
                .from('news-images')
                .getPublicUrl(event.image_path)
            setImageUrl(data.publicUrl)
        }
    }, [event.image_path])

    return (
        <div className={`event-card ${isExpanded ? 'expanded' : ''}`}>
            <img
                className="event-image"
                src={imageError || !imageUrl ? "/placeholder.png" : imageUrl}
                alt="Новина"
                onError={handleImageError}
            />
            <div className="event-details">
                <h2 className="event-name">{event.name}</h2>
                <p className="event-address">{event.short_address}</p>
                <p className="event-full-address">{event.full_address}</p>
                <p className="event-description">{event.description}</p>
            </div>
            <button className="event-button" onClick={onExpand}>
                {isExpanded ? "ЗАКРИТИ" : "ЧИТАТИ ДАЛІ"}
            </button>
        </div>
    );
}

export default EventCard;
