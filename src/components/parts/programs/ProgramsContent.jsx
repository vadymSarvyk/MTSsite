import React, { useEffect, useState } from "react"
import '@/styles/ProgramsContent.css'
import Carousel from "@/components/Carousel"
import { createClient } from '@/utils/supabase/client'

const SUPABASE_PROGRAMS_BUCKET = 'programs-images'
const PLACEHOLDER = '/placeholder.png'

function Program({ program }) {
    const [imgUrl, setImgUrl] = useState(PLACEHOLDER)

    useEffect(() => {
        if (program.image_path) {
            const supabase = createClient()
            const { data } = supabase
                .storage
                .from(SUPABASE_PROGRAMS_BUCKET)
                .getPublicUrl(program.image_path)
            if (data?.publicUrl) setImgUrl(data.publicUrl)
            else setImgUrl(PLACEHOLDER)
        } else {
            setImgUrl(PLACEHOLDER)
        }
    }, [program.image_path])

    return (
        <div className="slide container-row program">
            <div className="program-image">
                <img src={imgUrl} alt="..." />
            </div>
            <div className="program-body">
                <h4>{program.name}</h4>
                <p>{program.description}<br /><br /></p>
                {program.type && (
                    <p>
                        * Тип заняття: <b>{program.type}</b><br />
                    </p>
                )}
                {program.number_of_lessons && (
                    <p>
                        * Кількість занять: <b>{program.number_of_lessons}</b><br />
                    </p>
                )}
                {program.lesson_duration && (
                    <p>
                        * Тривалість занять: <b>{program.lesson_duration}</b><br />
                    </p>
                )}
                {program.course_duration && (
                    <p>
                        * Тривалість курсу: <b>{program.course_duration}</b><br />
                    </p>
                )}
                {program.course_price && (
                    <p>
                        * Вартість курсу: <b>{program.course_price} грн</b>
                    </p>
                )}
            </div>
        </div>
    )
}

export default function ProgramsContent({ programs }) {
    return (
        <Carousel>
            {programs.map((program, index) => (
                <Program key={index} program={program} />
            ))}
        </Carousel>
    )
}
