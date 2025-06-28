import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { authenticate } from '@/app/api/check-auth/authenticate';

export async function GET(req, { params }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { id } = params;

  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return Response.json({ message: 'News not found' }, { status: 404 });
  return Response.json(data);
}

export async function PUT(req, { params }) {
  const authError = authenticate(req);
  if (authError) return Response.json({ message: authError.error }, { status: authError.status });

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { id } = params;
  const formData = await req.formData();

  const fields = {
    name: formData.get('name'),
    short_address: formData.get('shortAddress'),
    full_address: formData.get('fullAddress'),
    description: formData.get('description'),
  };

  const image = formData.get('image');
  if (image && image.size > 0) {
    const fileName = `image-${Date.now()}.${image.name.split('.').pop()}`;
    const buffer = Buffer.from(await image.arrayBuffer());

    const { error: uploadError } = await supabase
      .storage
      .from('news-images')
      .upload(fileName, buffer, { contentType: image.type });

    if (uploadError) return Response.json({ message: uploadError.message }, { status: 500 });
    fields.image_path = fileName;

    const { data: old } = await supabase
      .from('news')
      .select('image_path')
      .eq('id', id)
      .single();

    if (old?.image_path) {
      await supabase.storage.from('news-images').remove([old.image_path]);
    }
  }

  const { data, error } = await supabase
    .from('news')
    .update(fields)
    .eq('id', id)
    .select()
    .single();

  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(req, { params }) {
  const authError = authenticate(req);
  if (authError) return Response.json({ message: authError.error }, { status: authError.status });

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { id } = params;

  const { data: old } = await supabase
    .from('news')
    .select('image_path')
    .eq('id', id)
    .single();

  if (old?.image_path) {
    await supabase.storage.from('news-images').remove([old.image_path]);
  }

  const { error } = await supabase.from('news').delete().eq('id', id);

  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json({ message: 'News deleted successfully' });
}
