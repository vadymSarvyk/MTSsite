import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { authenticate } from '@/app/api/check-auth/authenticate';

const bannerJsonPath = path.resolve(process.cwd(), 'src', 'db', 'banner.json');
const imagesDir = path.resolve(process.cwd(), 'public', 'images');

async function getCurrentBannerName() {
    try {
        const data = await fs.readFile(bannerJsonPath, 'utf8');
        return JSON.parse(data).bannerImage || "people.jpg";
    } catch {
        return "people.jpg";
    }
}

async function setBannerName(imageName) {
    const json = { bannerImage: imageName };
    await fs.writeFile(bannerJsonPath, JSON.stringify(json, null, 2));
}

export async function GET() {
    // Чтобы фронт мог узнать, какая сейчас картинка
    try {
        const bannerImage = await getCurrentBannerName();
        return NextResponse.json({ bannerImage });
    } catch {
        return NextResponse.json({ bannerImage: "people.jpg" });
    }
}

export async function POST(req) {
    const authError = authenticate(req);
    if (authError) {
        return NextResponse.json({ message: authError.error }, { status: authError.status });
    }
    try {
        const formData = await req.formData();
        const file = formData.get('banner');
        if (!file || file.size === 0) {
            return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
        }

        // Генерируем уникальное имя для файла
        const imageName = "banner-" + Date.now() + "." + file.name.split('.').pop();
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        await fs.writeFile(path.resolve(imagesDir, imageName), buffer);
        await setBannerName(imageName);

        return NextResponse.json({ bannerImage: imageName, message: 'Banner updated!' }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Error updating banner!' }, { status: 500 });
    }
}
