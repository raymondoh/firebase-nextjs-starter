// "use client";

// import type React from "react";
// import { useState, useTransition, useRef } from "react";
// import Image from "next/image";
// import { addProduct } from "@/actions/products";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
// import { toast } from "sonner";
// import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
// import { uploadFile } from "@/utils/uploadFile";
// import { validateFileSize } from "@/utils/validateFileSize";
// import { SubmitButton } from "@/components/shared/SubmitButton";

// interface ProductFormProps {
//   onSuccess?: () => void;
// }

// export function AddProductForm({ onSuccess }: ProductFormProps) {
//   const [isPending, startTransition] = useTransition();
//   const [isUploading, setIsUploading] = useState(false);
//   const [inStock, setInStock] = useState(true);
//   const [isFeatured, setIsFeatured] = useState(false);
//   const [isHero, setIsHero] = useState(false);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [productName, setProductName] = useState("");
//   const [nameError, setNameError] = useState<string | null>(null);

//   const imageInputRef = useRef<HTMLInputElement>(null);

//   function resetForm() {
//     setProductName("");
//     setNameError(null);
//     setPreviewUrl(null);
//     setInStock(true);
//     setIsFeatured(false);
//     setIsHero(false);
//     imageInputRef.current?.value && (imageInputRef.current.value = "");
//   }

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const validationError = validateFileSize(file, 2);
//     if (validationError) {
//       toast.error(validationError);
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = e => setPreviewUrl(e.target?.result as string);
//     reader.readAsDataURL(file);
//   };

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);

//     startTransition(async () => {
//       try {
//         if (productName.trim().length < 3) {
//           setNameError("Product name must be at least 3 characters.");
//           toast.error("Please enter a product name with at least 3 characters.");
//           return;
//         }

//         const file = formData.get("image") as File;
//         let imageUrl = "";

//         if (file && file.size > 0) {
//           setIsUploading(true);
//           imageUrl = await uploadFile(file, { prefix: "product" });
//         }

//         const nameValue = formData.get("productName") as string;
//         if (!nameValue || nameValue.trim().length < 3) {
//           toast.error("Product name must be at least 3 characters.");
//           return;
//         }

//         const result = await addProduct({
//           name: nameValue.trim(),
//           price: Number.parseFloat(formData.get("price") as string),
//           description: formData.get("description") as string,
//           inStock,
//           badge: formData.get("badge") as string,
//           image: imageUrl,
//           isFeatured,
//           isHero
//         });

//         if (result.success) {
//           toast.success("Product added successfully!");
//           resetForm();
//           onSuccess?.();
//         } else {
//           const message = Array.isArray(result.error)
//             ? result.error[0]?.message || "Invalid input"
//             : result.error || "Failed to add product";
//           toast.error(message);
//         }
//       } catch (err: unknown) {
//         const message = isFirebaseError(err)
//           ? firebaseError(err)
//           : err instanceof Error
//           ? err.message
//           : "Unknown error while adding product";
//         toast.error(message);
//         console.error("Error in AddProductForm submission:", err);
//       } finally {
//         setIsUploading(false);
//       }
//     });
//   };

//   return (
//     <div className="container max-w-3xl mx-auto py-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Add a New Product</CardTitle>
//           <CardDescription>Fill out the form to add a new product to your store.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <Label htmlFor="name">Product Name</Label>
//                 <Input
//                   id="name"
//                   name="productName"
//                   value={productName}
//                   onChange={e => {
//                     const value = e.target.value;
//                     setProductName(value);

//                     if (value.trim().length < 3) {
//                       setNameError("Product name must be at least 3 characters.");
//                     } else {
//                       setNameError(null);
//                     }
//                   }}
//                   required
//                 />
//                 {nameError && <p className="text-sm text-red-600 mt-1">{nameError}</p>}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="price">Price ($)</Label>
//                 <Input name="price" id="price" type="number" step="0.01" min="0" placeholder="0.00" required />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="badge">Badge (Optional)</Label>
//                 <Input name="badge" id="badge" placeholder="New, Sale, Featured, etc." />
//               </div>

//               <div className="flex items-center justify-between space-x-2">
//                 <Label htmlFor="inStock" className="cursor-pointer">
//                   In Stock
//                 </Label>
//                 <Switch name="inStock" id="inStock" checked={inStock} onCheckedChange={setInStock} />
//               </div>

//               <div className="flex items-center justify-between space-x-2">
//                 <Label htmlFor="isHero" className="cursor-pointer">
//                   Display in Hero Carousel
//                 </Label>
//                 <Switch name="isHero" id="isHero" checked={isHero} onCheckedChange={setIsHero} />
//               </div>

//               <div className="flex items-center justify-between space-x-2">
//                 <Label htmlFor="isFeatured" className="cursor-pointer">
//                   Feature this product
//                 </Label>
//                 <Switch name="isFeatured" id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
//               </div>

//               <div className="md:col-span-2 space-y-2">
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   name="description"
//                   id="description"
//                   rows={4}
//                   placeholder="Enter product description"
//                   required
//                 />
//               </div>

//               <div className="md:col-span-2 space-y-2">
//                 <Label htmlFor="image">Product Image</Label>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Input
//                       name="image"
//                       id="image"
//                       type="file"
//                       accept="image/*"
//                       ref={imageInputRef}
//                       required
//                       onChange={handleImageChange}
//                       className="cursor-pointer"
//                     />
//                     <p className="text-xs text-muted-foreground mt-1">Recommended size: 800x800px, max 2MB</p>
//                   </div>

//                   <div className="flex items-center justify-center border rounded-md h-[150px] bg-muted/30">
//                     {previewUrl ? (
//                       <div className="relative w-full h-full">
//                         <Image
//                           src={previewUrl || "/placeholder.svg"}
//                           alt="Preview"
//                           fill
//                           className="object-contain p-2"
//                           sizes="100vw"
//                         />
//                       </div>
//                     ) : (
//                       <div className="text-muted-foreground text-sm">Image preview will appear here</div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <CardFooter className="justify-end p-0 pt-4">
//               <SubmitButton
//                 isLoading={isPending || isUploading}
//                 loadingText={isUploading ? "Uploading..." : "Saving..."}
//                 className="min-w-[140px]">
//                 Add Product
//               </SubmitButton>
//             </CardFooter>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { addProduct } from "@/actions/products";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { toast } from "sonner";
import { uploadFile } from "@/utils/uploadFile";
import { validateFileSize } from "@/utils/validateFileSize";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";

interface ProductFormProps {
  onSuccess?: () => void;
}

export function AddProductForm({ onSuccess }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [details, setDetails] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");
  const [stickySide, setStickySide] = useState<"Front" | "Back" | "">("");
  const [category, setCategory] = useState("");

  const [inStock, setInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isHero, setIsHero] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setProductName("");
    setPrice("");
    setDescription("");
    setBadge("");
    setDetails("");
    setDimensions("");
    setMaterial("");
    setColor("");
    setStickySide("");
    setCategory("");
    setInStock(true);
    setIsFeatured(false);
    setIsHero(false);
    setPreviewUrl(null);
    setImageFile(null);
    setNameError(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFileSize(file, 2);
    if (error) {
      toast.error(error);
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = e => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (productName.trim().length < 2) {
      setNameError("Product name must be at least 2 characters.");
      toast.error("Please enter a valid product name.");
      return;
    }

    startTransition(async () => {
      try {
        let imageUrl = "";

        if (imageFile) {
          setIsUploading(true);
          imageUrl = await uploadFile(imageFile, { prefix: "product" });
        }

        const result = await addProduct({
          name: productName.trim(),
          price: Number.parseFloat(price),
          description,
          badge: badge || undefined,
          details: details || undefined,
          dimensions: dimensions || undefined,
          material: material || undefined,
          color: color || undefined,
          stickySide: stickySide || undefined,
          category: category || undefined,
          inStock,
          isFeatured,
          isHero,
          image: imageUrl
        });

        if (result.success) {
          toast.success(`"${productName}" added successfully! Redirecting...`);
          resetForm();
          onSuccess?.();
          setTimeout(() => router.push("/admin/products"), 2000);
        } else {
          toast.error(result.error || "Failed to add product");
        }
      } catch (error: unknown) {
        const message = isFirebaseError(error)
          ? firebaseError(error)
          : error instanceof Error
          ? error.message
          : "Unknown error occurred.";
        toast.error(message);
        console.error("[AddProductForm]", error);
      } finally {
        setIsUploading(false);
      }
    });
  }

  return (
    <div className="container max-w-3xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Add a New Product</CardTitle>
          <CardDescription>Fill out the form below to add a new product to your store.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={e => {
                    setProductName(e.target.value);
                    setNameError(e.target.value.length < 2 ? "Product name must be at least 2 characters." : null);
                  }}
                  required
                />
                {nameError && <p className="text-sm text-red-600">{nameError}</p>}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                />
              </div>

              {/* Badge */}
              <div className="space-y-2">
                <Label htmlFor="badge">Badge (Optional)</Label>
                <Input id="badge" value={badge} onChange={e => setBadge(e.target.value)} />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={category} onChange={e => setCategory(e.target.value)} />
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="inStock">In Stock</Label>
                <Switch id="inStock" checked={inStock} onCheckedChange={setInStock} />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="isFeatured">Featured</Label>
                <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="isHero">Hero Carousel</Label>
                <Switch id="isHero" checked={isHero} onCheckedChange={setIsHero} />
              </div>

              {/* Sticky Side */}
              <div className="space-y-2">
                <Label htmlFor="stickySide">Sticky Side</Label>
                <select
                  id="stickySide"
                  value={stickySide}
                  onChange={e => setStickySide(e.target.value as "Front" | "Back" | "")}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select sticky side</option>
                  <option value="Front">Front</option>
                  <option value="Back">Back</option>
                </select>
              </div>

              {/* Material */}
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input id="material" value={material} onChange={e => setMaterial(e.target.value)} />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input id="color" value={color} onChange={e => setColor(e.target.value)} />
              </div>

              {/* Dimensions */}
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input id="dimensions" value={dimensions} onChange={e => setDimensions(e.target.value)} />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Details */}
            <div className="space-y-2">
              <Label htmlFor="details">Details (Optional)</Label>
              <Textarea id="details" rows={3} value={details} onChange={e => setDetails(e.target.value)} />
            </div>

            {/* Product Image */}
            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={imageInputRef}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Max 2MB recommended.</p>
                </div>

                <div className="flex items-center justify-center border rounded-md h-[150px] bg-muted/30">
                  {previewUrl ? (
                    <div className="relative w-full h-full">
                      <Image src={previewUrl} alt="Preview" fill className="object-contain p-2" />
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">Image preview will appear here</div>
                  )}
                </div>
              </div>
            </div>

            <CardFooter className="justify-end p-0 pt-4">
              <SubmitButton
                isLoading={isPending || isUploading}
                loadingText={isUploading ? "Uploading..." : "Saving..."}
                className="min-w-[140px]">
                Add Product
              </SubmitButton>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
