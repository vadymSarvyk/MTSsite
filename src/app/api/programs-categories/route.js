import { createClient } from '@/utils/supabase/server';
import { authenticate } from '@/app/api/check-auth/authenticate';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: categories, error: catError } = await supabase
        .from('program_categories')
        .select('*')
        .order('id', { ascending: true });

    if (catError) {
        return Response.json({ message: 'Error fetching categories!', error: catError.message }, { status: 400 });
    }

    const { data: programs, error: progError } = await supabase
        .from('programs')
        .select('*');

    if (progError) {
        return Response.json({ message: 'Error fetching programs!', error: progError.message }, { status: 400 });
    }

    const withPrograms = categories.map(cat => ({
        ...cat,
        programs: programs.filter(prog => prog.category_id === cat.id)
    }));

    return Response.json(withPrograms, { status: 200 });
}

export async function POST(req) {
    const authError = authenticate(req);
    if (authError) {
        return Response.json({ message: authError.error }, { status: authError.status });
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const formData = await req.formData();
    const category_name = formData.get('categoryName');
    const description = formData.get('description');
    let image_path = null;

    const image = formData.get('image');
    if (image && image.size > 0) {
        const fileName = `category-${Date.now()}.${image.name.split('.').pop()}`;
        const buffer = Buffer.from(await image.arrayBuffer());
        const { error: uploadError } = await supabase
            .storage
            .from('programs-images')
            .upload(fileName, buffer, { contentType: image.type });
        if (uploadError) {
            return Response.json({ message: uploadError.message }, { status: 500 });
        }
        image_path = fileName;
    }

    const { data, error } = await supabase
        .from('program_categories')
        .insert({ category_name, description, image_path })
        .select()
        .single();

    if (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }

    return Response.json(data, { status: 201 });
}
