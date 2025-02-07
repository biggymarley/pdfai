import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { NextRequest } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export const runtime = "nodejs"; // We need file system access for LangChain

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Save file to disk temporarily (needed for LangChain's PDFLoader)
    const tempPath = path.join("/tmp", file.name);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempPath, fileBuffer);

    // Load PDF and extract text using LangChain
    const loader = new PDFLoader(tempPath);
    const docs = await loader.load();
    const text = docs.map((doc) => doc.pageContent).join("\n");

    // Delete temp file after processing
    await unlink(tempPath);

    return NextResponse.json({ text });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
