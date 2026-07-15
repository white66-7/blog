import * as mm from 'music-metadata-browser';

// 1. 解析本地 File 或 Blob
export async function extractCover(file: File | Blob): Promise<string | null> {
  try {
    const metadata = await mm.parseBlob(file);
    const picture = metadata.common.picture?.[0]; // 获取第一张图片
    
    if (picture && picture.data && picture.format) {
      // ✅ 修复类型报错：用 new Uint8Array() 包裹一下
      const blob = new Blob([new Uint8Array(picture.data)], { type: picture.format });
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (error: any) {
    console.warn('本地音频封面解析失败:', error.message);
    return null;
  }
}

// 2. 解析网络 URL
export async function extractCoverFromUrl(audioUrl: string): Promise<string | null> {
  try {
    const metadata = await mm.fetchFromUrl(audioUrl);
    const picture = metadata.common.picture?.[0];
    
    if (picture && picture.data && picture.format) {
      // ✅ 修复类型报错：用 new Uint8Array() 包裹一下
      const blob = new Blob([new Uint8Array(picture.data)], { type: picture.format });
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (e: any) {
    console.warn('fetch audio failed:', e.message);
    return null;
  }
}