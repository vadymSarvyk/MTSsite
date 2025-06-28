import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { authenticate } from '@/app/api/check-auth/authenticate'

export async function GET(req, { params }) {
    const { id } = params
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !data) {
        return Response.json({ message: 'Partner not found!' }, { status: 404 })
    }

    return Response.json(data, { status: 200 })
}

export async function PUT(req, { params }) {
    const authError = authenticate(req)
    if (authError) {
        return Response.json({ message: authError.error }, { status: authError.status })
    }

    const { id } = params
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const formData = await req.formData()
    const url = formData.get('url') || ''

    // Получаем старый image_path (если нужно удалить картинку)
    const { data: oldPartner } = await supabase
        .from('partners')
        .select('image_path')
        .eq('id', id)
        .single()

    let image_path = oldPartner?.image_path

    const image = formData.get('image')
    if (image && image.size > 0) {
        // удалить старое изображение
        if (image_path) {
            await supabase.storage.from('partners-images').remove([image_path])
        }
        // загрузить новое
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

    const { data: updated, error } = await supabase
        .from('partners')
        .update({ url, image_path })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        return Response.json({ message: error.message }, { status: 400 })
    }

    return Response.json(updated, { status: 200 })
}

export async function DELETE(req, { params }) {
    const authError = authenticate(req)
    if (authError) {
        return Response.json({ message: authError.error }, { status: authError.status })
    }

    const { id } = params
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Получаем картинку для удаления из storage
    const { data: oldPartner } = await supabase
        .from('partners')
        .select('image_path')
        .eq('id', id)
        .single()

    if (oldPartner?.image_path) {
        await supabase.storage.from('partners-images').remove([oldPartner.image_path])
    }

    const { error } = await supabase.from('partners').delete().eq('id', id)

    if (error) {
        return Response.json({ message: error.message }, { status: 400 })
    }

    return Response.json({ message: 'Partner deleted successfully!' }, { status: 200 })
}
