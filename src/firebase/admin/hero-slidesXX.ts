// "use server";

// import { adminDb } from "./index";
// import { Timestamp } from "firebase-admin/firestore";
// import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
// import type { SerializedHeroSlide, GetHeroSlidesResult, GetHeroSlidesError } from "@/types/carousel/hero";

// // ================= Hero Slides =================

// export type GetHeroSlidesResponse = GetHeroSlidesResult | GetHeroSlidesError;

// export async function getHeroSlides(): Promise<GetHeroSlidesResponse> {
//   try {
//     const snapshot = await adminDb.collection("heroSlides").orderBy("order").where("active", "==", true).get();

//     const slides: SerializedHeroSlide[] = snapshot.docs.map(doc => {
//       const data = doc.data();

//       return {
//         id: doc.id,
//         title: data.title,
//         description: data.description,
//         backgroundImage: data.backgroundImage,
//         cta: data.cta,
//         ctaHref: data.ctaHref,
//         order: data.order,
//         active: data.active,
//         createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
//         updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt
//       };
//     });

//     return { success: true, slides };
//   } catch (error: unknown) {
//     const message = isFirebaseError(error)
//       ? firebaseError(error)
//       : error instanceof Error
//       ? error.message
//       : "Unknown error fetching hero slides";

//     console.error("Error fetching hero slides:", message);
//     return { success: false, error: message };
//   }
// }
