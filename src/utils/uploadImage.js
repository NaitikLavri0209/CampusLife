export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "campuslife_preset");        // paste your preset name here
  formData.append("cloud_name", "djgpnotrc");             // paste your cloud name here

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/djgpnotrc/image/upload`,  // paste cloud name here too
    { method: "POST", body: formData }
  );

  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.secure_url;
}