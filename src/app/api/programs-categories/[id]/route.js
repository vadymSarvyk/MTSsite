import { createClient } from '@/utils/supabase/server';
import { authenticate } from '@/app/api/check-auth/authenticate';
import { cookies } from 'next/headers';

export async function GET(req, { params }) {
    const { id } = params;
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: category, error: catError } = await supabase
        .from('program_categories')
        .select('*')
        .eq('id', id)
        .single();

    if (catError || !category) {
        return Response.json({ message: 'Category not found!' }, { status: 404 });
    }

    const { data: programs, error: progError } = await supabase
        .from('programs')
        .select('*')
        .eq('category_id', id);

    if (progError) {
        return Response.json({ message: 'Error fetching programs!', error: progError.message }, { status: 400 });
    }

    return Response.json({ ...category, programs }, { status: 200 });
}

export async function PUT(req, { params }) {
    const authError = authenticate(req);
    if (authError) return Response.json({ message: authError.error }, { status: authError.status });

    const { id } = params;
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const formData = await req.formData();
    const category_name = formData.get('categoryName');
    const description = formData.get('description');

    let image_path = undefined;

    const { data: old } = await supabase
        .from('program_categories')
        .select('image_path')
        .eq('id', id)
        .single();

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

        if (old?.image_path) {
            await supabase.storage.from('programs-images').remove([old.image_path]);
        }
    }

    const fields = { category_name, description };
    if (image_path !== undefined) fields.image_path = image_path;

    const { data, error } = await supabase
        .from('program_categories')
        .update(fields)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }
    return Response.json(data, { status: 200 });
}

export async function DELETE(req, { params }) {
    const authError = authenticate(req);
    if (authError) return Response.json({ message: authError.error }, { status: authError.status });

    const { id } = params;
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: old } = await supabase
        .from('program_categories')
        .select('image_path')
        .eq('id', id)
        .single();

    if (old?.image_path) {
        await supabase.storage.from('programs-images').remove([old.image_path]);
    }

    const { error } = await supabase.from('program_categories').delete().eq('id', id);

    if (error) return Response.json({ message: error.message }, { status: 500 });
    return Response.json({ message: 'Category deleted successfully!' }, { status: 200 });
}
