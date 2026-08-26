import * as mm from 'music-metadata';

// 解析本地用户上传的 File 或 Blob（毫秒级本地解析）
export async function extractCover(file: File | Blob): Promise<string | null> {
  try {
    const metadata = await mm.parseBlob(file);
    const picture = metadata.common.picture?.[0];
    
    if (picture && picture.data && picture.format) {
      const blob = new Blob([new Uint8Array(picture.data)], { type: picture.format });
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (error: any) {
    console.warn('本地音频封面解析失败:', error.message);
    return null;
  }
}