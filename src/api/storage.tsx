import {decode} from 'base64-arraybuffer';
import {supabase} from '../lib/supabase';
import RNFS from 'react-native-fs';
interface UploadFileResponse {
  data: {path: string} | null | undefined;
  error: Error | null;
}

interface DownloadFileResponse {
  data: Blob | null;
  error: Error | null;
}

export const uploadFile = async (
  bucket: string,
  path: string,
  file: any,
): Promise<UploadFileResponse> => {
  let imageData = '';
  if (
    file.startsWith('data:image') ||
    file.match(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/)
  ) {
    imageData = file.includes('base64,') ? file.split('base64,')[1] : file;
  } else {
    imageData = await RNFS.readFile(file, 'base64');
  }
  const {data, error} = await supabase.storage
    .from(bucket)
    .upload(path, decode(imageData), {
      upsert: true,
      contentType: 'image/png',
      cacheControl: 'no-cache',
    });
  return {data, error};
};

export const downloadFile = async (
  bucket: string,
  path: string,
): Promise<DownloadFileResponse> => {
  const {data, error} = await supabase.storage.from(bucket).download(path);
  return {data, error};
};
