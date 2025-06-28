import { createClient } from '@/utils/supabase/server';
import { authenticate } from '@/app/api/check-auth/authenticate';
import { cookies } from 'next/headers';

export async function PUT(req, { params }) {
    const authError = authenticate(req);
    if (authError) {
        return Response.json({ message: authError.error }, { status: authError.status });
    }

    const { id } = params;
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const formData = await req.formData();
    const category_id = Number(formData.get('categoryId'));
    const name = formData.get('name');
    const description = formData.get('description');
    const type = formData.get('type');
    const number_of_lessons = formData.get('numberOfLessons');
    const lesson_duration = formData.get('lessonDuration');
    const course_duration = formData.get('courseDuration');
    const course_price = formData.get('coursePrice');
    let image_path = undefined;

    // Получаем старую программу (для удаления картинки)
    const { data: oldProgram } = await supabase
        .from('programs')
        .select('image_path')
        .eq('id', id)
        .single();

    const image = formData.get('image');
    if (image && image.size > 0) {
        // Удалить старое изображение
        if (oldProgram?.image_path) {
            await supabase.storage.from('programs-images').remove([oldProgram.image_path]);
        }
        // Загрузить новое
        const fileName = `image-${Date.now()}.${image.name.split('.').pop()}`;
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

    const updateFields = {
        category_id,
        name,
        description,
        type,
        number_of_lessons,
        lesson_duration,
        course_duration,
        course_price,
    };
    if (image_path !== undefined) updateFields.image_path = image_path;

    const { data, error } = await supabase
        .from('programs')
        .update(updateFields)
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
    if (authError) {
        return Response.json({ message: authError.error }, { status: authError.status });
    }

    const { id } = params;
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Получаем программу (для удаления картинки)
    const { data: program } = await supabase
        .from('programs')
        .select('image_path')
        .eq('id', id)
        .single();

    if (program?.image_path) {
        await supabase.storage.from('programs-images').remove([program.image_path]);
    }

    const { error } = await supabase.from('programs').delete().eq('id', id);

    if (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }

    return Response.json({ message: 'Program successfully deleted!' }, { status: 200 });
}