export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "campuslife_preset"); // not placeholder
  formData.append("cloud_name", "djgpnotrc"); // not placeholder

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/YOUR_ACTUAL_CLOUD_NAME/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.secure_url;
}