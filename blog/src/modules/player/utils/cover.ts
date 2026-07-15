import * as mm from 'music-metadata';

// 1. 解析本地 File 或 Blob（这个保持不变）
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

// 2. 解析网络 URL（修复版）
export async function extractCoverFromUrl(audioUrl: string): Promise<string | null> {
  try {
    // 1. 先 fetch 音频文件
    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const audioBlob = await response.blob();

    // 2. 用 music-metadata 解析 blob
    const metadata = await mm.parseBlob(audioBlob);
    const picture = metadata.common.picture?.[0];
    
    if (picture && picture.data && picture.format) {
      const coverBlob = new Blob([new Uint8Array(picture.data)], { type: picture.format });
      return URL.createObjectURL(coverBlob);
    }
    return null;
  } catch (e: any) {
    console.warn('fetch audio failed:', e.message);
    return null;
  }
}