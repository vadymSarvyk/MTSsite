import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { authenticate } from '@/app/api/check-auth/authenticate'

export async function GET() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('id', { ascending: true })

    if (error) {
        return Response.json({ message: 'Error fetching partners!', error: error.message }, { status: 400 })
    }
    return Response.json(data, { status: 200 })
}

export async function POST(req) {
    const authError = authenticate(req)
    if (authError) {
        return Response.json({ message: authError.error }, { status: authError.status })
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const formData = await req.formData()
    const url = formData.get('url') || ''
    let image_path = null

    const image = formData.get('image')
    if (image && image.size > 0) {
        const fileName = `image-${Date.now()}.${image.name.split('.').pop()}`
        const buffer = Buffer.from(await image.arrayBuffer())
        const { error: uploadError } = await supabase
            .storage
            .from('partners-images')
            .upload(fileName, buffer, { contentType: image.type })
        if (uploadError) {
            return Response.json({ message: uploadError.message }, { status: 500 })
        }
        image_path = fileName
    }

    const { data, error } = await supabase
        .from('partners')
        .insert({ url, image_path })
        .select()
        .single()

    if (error) {
        return Response.json({ message: error.message }, { status: 400 })
    }

    return Response.json(data, { status: 201 })
}
