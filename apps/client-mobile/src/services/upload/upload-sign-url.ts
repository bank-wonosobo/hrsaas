import ReactNativeBlobUtil from "react-native-blob-util";

export const uploadSignUrl = async (
  uploadUrl: string,
  file: { uri: string; mimeType: string },
): Promise<void> => {
  // react-native-blob-util tidak menggunakan prefix file://
  const path = file.uri.replace("file://", "");

  const response = await ReactNativeBlobUtil.fetch(
    "PUT",
    uploadUrl,
    {
      "Content-Type": file.mimeType,
    },
    ReactNativeBlobUtil.wrap(path),
  );

  const status = response.info().status;

  if (status !== 200) {
    throw new Error(`Upload gagal (${status})`);
  }
};
