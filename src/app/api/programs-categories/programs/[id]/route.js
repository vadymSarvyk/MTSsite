import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { authenticate } from '@/app/api/check-auth/authenticate';

const jsonFilePath = path.resolve(process.cwd(), 'src', 'db', 'programs.json');
const imagesDir = path.resolve(process.cwd(), 'public', 'images');

// Helper to read/write categories
async function readCategories() {
    const data = await fs.readFile(jsonFilePath, 'utf8');
    return JSON.parse(data);
}

async function writeCategories(categories) {
    await fs.writeFile(jsonFilePath, JSON.stringify(categories, null, 2));
}

export async function PUT(req, { params }) {
    const authError = authenticate(req);
    if (authError) {
        return NextResponse.json({ message: authError.error }, { status: authError.status });
    }

    const { id } = params;
    const formData = await req.formData();
    const data = Object.fromEntries(formData);

    let { categoryId, newCategoryId, name, description, type, numberOfLessons, lessonDuration, courseDuration, coursePrice } = data;

    try {
        // Load categories
        const categories = await readCategories();

        // Найти старую категорию
        const oldCategoryIndex = categories.findIndex(cat => String(cat.id) === String(categoryId));
        if (oldCategoryIndex === -1) {
            return NextResponse.json({ message: 'Category not found!' }, { status: 404 });
        }
        const oldCategory = categories[oldCategoryIndex];

        // Найти программу в старой категории
        const programIndex = oldCategory.programs.findIndex(program => String(program.id) === String(id));
        if (programIndex === -1) {
            return NextResponse.json({ message: 'Program not found!' }, { status: 404 });
        }
        let program = oldCategory.programs[programIndex];

        // Обработка картинки
        let imagePath = program.imagePath;
        const uploadedImage = formData.get("image");
        if (uploadedImage && uploadedImage.size > 0) {
            // Удаляем старую картинку, если была
            if (imagePath) {
                try {
                    await fs.unlink(path.resolve(imagesDir, imagePath));
                } catch (e) {
                    // не критично, если файл не найден
                }
            }
            // Сохраняем новую
            const arrayBuffer = await uploadedImage.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);
            const imageName = `image-${Date.now()}.${uploadedImage.name.split('.').pop()}`;
            await fs.writeFile(path.resolve(imagesDir, imageName), buffer);
            imagePath = imageName;
        }

        // Обновлённая программа
        const updatedProgram = {
            ...program,
            name,
            description,
            type,
            numberOfLessons: numberOfLessons || "",
            lessonDuration: lessonDuration || "",
            courseDuration: courseDuration || "",
            coursePrice: coursePrice || "",
            imagePath
        };

        // Перемещение в другую категорию, если надо
        if (newCategoryId && newCategoryId !== categoryId) {
            // Найти новую категорию
            const newCategoryIndex = categories.findIndex(cat => String(cat.id) === String(newCategoryId));
            if (newCategoryIndex === -1) {
                return NextResponse.json({ message: 'New category not found!' }, { status: 404 });
            }
            // Удалить из старой
            oldCategory.programs.splice(programIndex, 1);
            // Добавить в новую
            categories[newCategoryIndex].programs.push(updatedProgram);
        } else {
            // Просто обновить программу
            oldCategory.programs[programIndex] = updatedProgram;
        }

        // Сохранить файл
        await writeCategories(categories);

        return NextResponse.json(updatedProgram, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Error updating program!' }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    const authError = authenticate(req);
    if (authError) {
        return NextResponse.json({ message: authError.error }, { status: authError.status });
    }

    const { id } = params;
    const formData = await req.formData();
    const { categoryId } = Object.fromEntries(formData);

    try {
        const categories = await readCategories();
        const categoryIndex = categories.findIndex(cat => String(cat.id) === String(categoryId));
        if (categoryIndex === -1) {
            return NextResponse.json({ message: 'Category not found!' }, { status: 404 });
        }
        const category = categories[categoryIndex];
        const programIndex = category.programs.findIndex(program => String(program.id) === String(id));
        if (programIndex === -1) {
            return NextResponse.json({ message: 'Program not found!' }, { status: 404 });
        }

        const [deletedProgram] = category.programs.splice(programIndex, 1);

        // Удалить картинку, если есть
        if (deletedProgram.imagePath) {
            try {
                await fs.unlink(path.resolve(imagesDir, deletedProgram.imagePath));
            } catch (e) {
                // не критично
            }
        }

        await writeCategories(categories);

        return NextResponse.json({ message: 'Program successfully deleted!' }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Error deleting program!' }, { status: 400 });
    }
}
