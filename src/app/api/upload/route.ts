import { NextRequest, NextResponse } from 'next/server';
import { isSupportedFileType, detectLanguage, formatFileSize } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isSupportedFileType(file.name)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type: ${file.name}. Supported: .js, .ts, .jsx, .tsx, .py, .java, .cpp, .c, .go, .rs`,
        },
        { status: 400 }
      );
    }

    // Validate file size (max 100KB)
    const maxSize = 100 * 1024; // 100KB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds 100KB limit. Current size: ${formatFileSize(file.size)}`,
        },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();

    // Detect language
    const language = detectLanguage(file.name);
    if (!language) {
      return NextResponse.json(
        { success: false, error: 'Could not detect programming language' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        content,
        language,
        size: file.size,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process file upload' },
      { status: 500 }
    );
  }
}
