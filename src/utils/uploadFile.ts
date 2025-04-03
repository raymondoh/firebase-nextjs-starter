// src/utils/uploadFile.ts

// export async function uploadFile(file: File, options?: { prefix?: string }): Promise<string> {
//   try {
//     const fileName = options?.prefix ? `${options.prefix}-${file.name}` : file.name;
//     const renamedFile = new File([file], fileName, { type: file.type });

//     const formData = new FormData();
//     formData.append("file", renamedFile);

//     const response = await fetch("/api/upload", {
//       method: "POST",
//       body: formData
//     });

//     const result = await response.json();
//     if (!response.ok) throw new Error(result.error || "Upload failed");

//     return result.url;
//   } catch (err) {
//     const message = err instanceof Error ? err.message : "Upload error";
//     // Optionally toast here — or toast in the component if preferred
//     throw new Error(message);
//   }
// }
// export async function uploadFile(file: File, prefix?: string): Promise<string> {
//   const renamed = prefix ? new File([file], `${prefix}-${file.name}`, { type: file.type }) : file;

//   const formData = new FormData();
//   formData.append("file", renamed);

//   const response = await fetch("/api/upload", {
//     method: "POST",
//     body: formData
//   });

//   const result = await response.json();
//   if (!response.ok) throw new Error(result.error || "Upload failed");

//   return result.url;
// }
// src/utils/uploadFile.ts

interface UploadOptions {
  prefix?: string;
}

export async function uploadFile(file: File, options: UploadOptions = {}): Promise<string> {
  const { prefix } = options;
  const renamedFile = new File([file], `${prefix || "upload"}-${file.name}`, { type: file.type });

  const formData = new FormData();
  formData.append("file", renamedFile);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Upload failed");

  return result.url;
}
