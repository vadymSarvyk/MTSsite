import { createClient } from '@/utils/supabase/server';
import { authenticate } from '@/app/api/check-auth/authenticate';
import { cookies } from 'next/headers';

export async function POST(req) {
    const authError = authenticate(req);
    if (authError) {
        return Response.json({ message: authError.error }, { status: authError.status });
    }

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
    let image_path = null;

    const image = formData.get('image');
    if (image && image.size > 0) {
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

    const { data, error } = await supabase
        .from('programs')
        .insert({
            category_id,
            name,
            description,
            type,
            number_of_lessons,
            lesson_duration,
            course_duration,
            course_price,
            image_path,
        })
        .select()
        .single();

    if (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }

    return Response.json(data, { status: 201 });
}
