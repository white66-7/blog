import * as jsmediatagsModule from 'jsmediatags'

const jsmediatags: any = jsmediatagsModule.default || jsmediatagsModule

export function extractCover(file: File | Blob): Promise<string | null> {
  return new Promise((resolve) => {
    jsmediatags.read(file, {
      onSuccess: (tag: any) => {
        if (tag.tags && tag.tags.picture) {
          const pic = tag.tags.picture
          const blob = new Blob([new Uint8Array(pic.data)], { type: pic.format })
          resolve(URL.createObjectURL(blob))
        } else {
          resolve(null)
        }
      },
      onError: (error: any) => {
        console.warn('本地音频封面解析失败:', error.info || error.message)
        resolve(null)
      }
    })
  })
}

import * as mm from 'music-metadata-browser';

export async function extractCoverFromUrl(audioUrl: string): Promise<string | null> {
  try {
    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();

    return new Promise((resolve) => {
      jsmediatags.read(blob, {
        onSuccess: (tag: any) => {
          const picture = tag.tags?.picture;
          if (picture && picture.data && picture.format) {
            const base64 = btoa(String.fromCharCode(...new Uint8Array(picture.data)));
            resolve(`data:${picture.format};base64,${base64}`);
          } else {
            resolve(null);
          }
        },
        onError: (err: any) => {
          console.warn('jsmediatags error:', err);
          resolve(null);
        }
      });
    });
  } catch (e) {
    console.warn('fetch audio failed:', e);
    return null;
  }
}