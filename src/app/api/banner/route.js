import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { authenticate } from '@/app/api/check-auth/authenticate'

const BUCKET = 'page-assets'
const DEFAULT_IMAGE = 'people.jpg' 

export async function GET() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { data, error } = await supabase
        .from('page')
        .select('banner_image')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

    let image_path = data?.banner_image || DEFAULT_IMAGE

    const { data: urlData } = supabase
        .storage
        .from(BUCKET)
        .getPublicUrl(image_path)

    return Response.json({ bannerUrl: urlData?.publicUrl || '/images/people.jpg' })
}

export async function POST(req) {
    const authError = authenticate(req)
    if (authError) {
        return Response.json({ message: authError.error }, { status: authError.status })
    }
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const formData = await req.formData()
    const file = formData.get('banner')
    if (!file || file.size === 0) {
        return Response.json({ message: 'No file uploaded' }, { status: 400 })
    }

    const { data: oldData } = await supabase
        .from('page')
        .select('banner_image')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()
    let old_banner = oldData?.banner_image

    const imageName = `banner-${Date.now()}.${file.name.split('.').pop()}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const { error: uploadError } = await supabase
        .storage
        .from(BUCKET)
        .upload(imageName, buffer, { contentType: file.type })
    if (uploadError) {
        return Response.json({ message: uploadError.message }, { status: 500 })
    }

    if (old_banner && old_banner !== DEFAULT_IMAGE) {
        await supabase.storage.from(BUCKET).remove([old_banner])
    }

    const { error: upsertError } = await supabase
        .from('page')
        .upsert({ id: 1, banner_image: imageName, updated_at: new Date().toISOString() }, { onConflict: ['id'] })

    if (upsertError) {
        return Response.json({ message: upsertError.message }, { status: 500 })
    }

    const { data: urlData } = supabase
        .storage
        .from(BUCKET)
        .getPublicUrl(imageName)

    return Response.json({ bannerUrl: urlData?.publicUrl, message: 'Banner updated!' }, { status: 200 })
}
