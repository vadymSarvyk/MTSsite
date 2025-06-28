import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { authenticate } from '@/app/api/check-auth/authenticate';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req) {
  const authError = authenticate(req);
  if (authError) return Response.json({ message: authError.error }, { status: authError.status });

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const formData = await req.formData();

  const name = formData.get('name');
  const shortAddress = formData.get('shortAddress');
  const fullAddress = formData.get('fullAddress');
  const description = formData.get('description');
  const image = formData.get('image');

  let imagePath = null;
  if (image && image.size > 0) {
    const fileName = `image-${Date.now()}.${image.name.split('.').pop()}`;
    const buffer = Buffer.from(await image.arrayBuffer());

    const { error: uploadError } = await supabase
      .storage
      .from('news-images')
      .upload(fileName, buffer, { contentType: image.type });

    if (uploadError) return Response.json({ message: uploadError.message }, { status: 500 });
    imagePath = fileName;
  }

  const { data, error } = await supabase
    .from('news')
    .insert({
      name,
      short_address: shortAddress,
      full_address: fullAddress,
      description,
      image_path: imagePath,
    })
    .select()
    .single();

  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
