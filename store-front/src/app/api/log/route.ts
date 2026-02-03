import { NextRequest, NextResponse } from 'next/server';
import { writeFile, appendFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const logLine = await request.text();

    if (!logLine) {
      return NextResponse.json({ error: 'No log data provided' }, { status: 400 });
    }

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      const logFilePath = join(process.cwd(), 'store-front.log');

      try {
        // Append log line to the file
        await appendFile(logFilePath, logLine + '\n', 'utf-8');
      } catch (err) {
        // If file doesn't exist, create it
        await writeFile(logFilePath, logLine + '\n', 'utf-8');
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error writing log:', error);
    return NextResponse.json({ error: 'Failed to write log' }, { status: 500 });
  }
}
