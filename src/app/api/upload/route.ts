import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disable built-in body parsing, needed for streaming/formdata
  },
};

export async function POST(req: Request) {
  try {
    // Parse incoming form data
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert Blob to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create uploads folder if not exists
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // Use original filename if available or fallback
    const filename = (file as any).name || `upload-${Date.now()}.jpg`;
    const filePath = path.join(uploadDir, filename);

    // Write file to disk
    await fs.promises.writeFile(filePath, buffer);

    return NextResponse.json({ message: 'File uploaded', filename });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
