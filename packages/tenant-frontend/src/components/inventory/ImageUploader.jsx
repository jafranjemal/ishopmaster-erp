import React, { useState } from "react";
import { Button, Badge, Label } from "ui-library";
import { UploadCloud, X, Star } from "lucide-react";
import { toast } from "react-hot-toast";

// This is a mock function. In a real app, this would call the Cloudinary API.
const mockUploadService = async (file) => {
  console.log(`Uploading ${file.name}...`);
  await new Promise((res) => setTimeout(res, 1000));
  // Return a placeholder URL
  return `https://placehold.co/600x400/0f172a/f1f5f9?text=${file.name}`;
};

const ImageUploader = ({ images = [], onChange }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const uploadPromise = mockUploadService(file);

    toast.promise(uploadPromise, {
      loading: "Uploading image...",
      success: "Image uploaded!",
      error: "Upload failed.",
    });

    try {
      const newUrl = await uploadPromise;
      const newImage = {
        url: newUrl,
        isPrimary: images.length === 0, // Make the first image primary by default
      };
      onChange([...images, newImage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimary = (indexToSet) => {
    const newImages = images.map((img, index) => ({
      ...img,
      isPrimary: index === indexToSet,
    }));
    onChange(newImages);
  };

  const handleRemoveImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    // If we remove the primary image, make the new first one primary
    if (images[indexToRemove].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    onChange(newImages);
  };

  return (
    <div>
      <Label>Product Images</Label>
      <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group aspect-square">
            <img
              src={image.url}
              alt={`Product image ${index + 1}`}
              className="object-cover w-full h-full rounded-md"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={() => handleSetPrimary(index)}
              >
                <Star
                  className={`h-4 w-4 ${
                    image.isPrimary ? "fill-amber-300 text-amber-300" : ""
                  }`}
                />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {image.isPrimary && (
              <Badge className="absolute top-1 right-1">Primary</Badge>
            )}
          </div>
        ))}
        <label className="flex items-center justify-center aspect-square border-2 border-dashed border-slate-700 rounded-md cursor-pointer hover:bg-slate-800 hover:border-indigo-500 transition-colors">
          <div className="text-center">
            <UploadCloud className="mx-auto h-8 w-8 text-slate-500" />
            <span className="mt-2 text-xs text-slate-400">Upload</span>
          </div>
          <input
            type="file"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isUploading}
            accept="image/*"
          />
        </label>
      </div>
    </div>
  );
};

export default ImageUploader;
