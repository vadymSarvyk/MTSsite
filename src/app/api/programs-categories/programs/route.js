import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { authenticate } from '@/app/api/check-auth/authenticate';

const jsonFilePath = path.resolve(process.cwd(), 'src', 'db', 'programs.json');
const imagesDir = path.resolve(process.cwd(), 'public', 'images');

// Helper functions
async function readCategories() {
    const data = await fs.readFile(jsonFilePath, 'utf8');
    return JSON.parse(data);
}

async function writeCategories(categories) {
    await fs.writeFile(jsonFilePath, JSON.stringify(categories, null, 2));
}

export async function POST(req) {
    const authError = authenticate(req);
    if (authError) {
        return NextResponse.json({ message: authError.error }, { status: authError.status });
    }

    try {
        const formData = await req.formData();
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        const { categoryId, name, description, type, numberOfLessons, lessonDuration, courseDuration, coursePrice } = data;

        // Загружаем категории
        const categories = await readCategories();

        // Ищем нужную категорию
        const categoryIndex = categories.findIndex(cat => String(cat.id) === String(categoryId));
        if (categoryIndex === -1) {
            return NextResponse.json({ message: 'Category not found!' }, { status: 404 });
        }
        const category = categories[categoryIndex];

        // Обработка изображения
        let imagePath = '';
        const image = formData.get("image");
        if (image && image.size > 0) {
            const arrayBuffer = await image.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);
            const imageName = "image-" + Date.now() + "." + image.name.split('.').pop();
            await fs.writeFile(path.resolve(imagesDir, imageName), buffer);
            imagePath = imageName;
        }

        // Генерируем id для программы (например, по времени)
        const newProgramId = Date.now();

        // Создаем новую программу
        const newProgram = {
            id: newProgramId,
            name,
            description,
            type,
            numberOfLessons,
            lessonDuration,
            courseDuration,
            coursePrice,
            imagePath
        };

        // Добавляем в категорию
        category.programs = category.programs || [];
        category.programs.push(newProgram);

        // Сохраняем изменения
        categories[categoryIndex] = category;
        await writeCategories(categories);

        return NextResponse.json(newProgram, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Error creating program!' }, { status: 400 });
    }
}
