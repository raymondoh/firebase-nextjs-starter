// "use server";

// import bcryptjs from "bcryptjs";
// import { adminAuth, adminDb } from "@/firebase/admin";
// import { logActivity } from "@/firebase/utils/activity";
// import { registerSchema } from "@/schemas/auth";
// import type { RegisterState } from "@/types/auth";

// // Functions: registerUser
// // The registerUser function is used to register a new user account.
// // It creates a new user in Firebase Auth and a user document in Firestore.

// // REGISTRATION
// export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
//   // Extract form data
//   const name = formData.get("name") as string;
//   const email = formData.get("email") as string;
//   const password = formData.get("password") as string;
//   const confirmPassword = formData.get("confirmPassword") as string;

//   // Validate using the schema
//   const validationResult = registerSchema.safeParse({
//     email,
//     password,
//     confirmPassword
//   });

//   if (!validationResult.success) {
//     // Extract the first error message
//     const errorMessage = validationResult.error.issues[0]?.message || "Invalid form data";
//     return {
//       success: false,
//       message: errorMessage
//     };
//   }

//   try {
//     // Hash the password
//     const salt = await bcryptjs.genSalt(10);
//     const passwordHash = await bcryptjs.hash(password, salt);

//     // Create the user in Firebase Auth
//     let userRecord;
//     try {
//       userRecord = await adminAuth.createUser({
//         email,
//         password,
//         displayName: name || email.split("@")[0] // Use email username as fallback
//       });
//     } catch (error: any) {
//       if (error.code === "auth/email-already-exists") {
//         return {
//           success: false,
//           message: "Email already in use. Please try logging in instead."
//         };
//       }
//       throw error;
//     }

//     // Create user document in Firestore with the hashed password
//     await adminDb
//       .collection("users")
//       .doc(userRecord.uid)
//       .set({
//         name: name || email.split("@")[0], // Use email username as fallback
//         email,
//         role: "user",
//         passwordHash, // Store the hashed password
//         createdAt: new Date()
//       });

//     // Log activity
//     await logActivity({
//       userId: userRecord.uid,
//       type: "login",
//       description: "Account created",
//       status: "success"
//     });

//     // Return the user ID, email, and role along with success message
//     return {
//       success: true,
//       message: "Registration successful!",
//       userId: userRecord.uid,
//       email: email,
//       role: "user"
//     };
//   } catch (error) {
//     console.error("Registration error:", error);
//     return {
//       success: false,
//       message: "An error occurred during registration. Please try again."
//     };
//   }
// }
// "use server";

// import bcryptjs from "bcryptjs";
// import { adminAuth, adminDb } from "@/firebase/admin";
// import { logActivity } from "@/firebase/utils/activity";
// import { registerSchema } from "@/schemas/auth/register";
// import type { RegisterState } from "@/types/auth";

// // Functions: registerUser
// // The registerUser function is used to register a new user account.
// // It creates a new user in Firebase Auth and a user document in Firestore.

// // REGISTRATION
// export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
//   console.log("registerUser server action called", {
//     formDataExists: formData ? true : false,
//     prevState
//   });

//   // Extract form data
//   const name = formData.get("name") as string;
//   const email = formData.get("email") as string;
//   const password = formData.get("password") as string;
//   const confirmPassword = formData.get("confirmPassword") as string;

//   console.log("Form data extracted", {
//     nameExists: !!name,
//     emailExists: !!email,
//     passwordExists: !!password,
//     confirmPasswordExists: !!confirmPassword
//   });

//   // Validate using the schema
//   const validationResult = registerSchema.safeParse({
//     email,
//     password,
//     confirmPassword
//   });

//   if (!validationResult.success) {
//     // Extract the first error message
//     const errorMessage = validationResult.error.issues[0]?.message || "Invalid form data";
//     return {
//       success: false,
//       message: errorMessage,
//       errors: {
//         general: [errorMessage]
//       }
//     };
//   }

//   try {
//     console.log("Creating user in Firebase Auth");
//     // Hash the password
//     const salt = await bcryptjs.genSalt(10);
//     const passwordHash = await bcryptjs.hash(password, salt);

//     // Create the user in Firebase Auth
//     let userRecord;
//     try {
//       userRecord = await adminAuth.createUser({
//         email,
//         password,
//         displayName: name || email.split("@")[0] // Use email username as fallback
//       });
//       console.log("User created in Firebase Auth:", userRecord.uid);
//     } catch (error: any) {
//       console.error("Error creating user in Firebase Auth:", error);
//       if (error.code === "auth/email-already-exists") {
//         return {
//           success: false,
//           message: "Email already in use. Please try logging in instead.",
//           errors: {
//             email: ["Email already in use. Please try logging in instead."]
//           }
//         };
//       }
//       throw error;
//     }

//     console.log("Creating user document in Firestore");
//     // Create user document in Firestore with the hashed password
//     await adminDb
//       .collection("users")
//       .doc(userRecord.uid)
//       .set({
//         name: name || email.split("@")[0], // Use email username as fallback
//         email,
//         role: "user",
//         passwordHash, // Store the hashed password
//         createdAt: new Date()
//       });
//     console.log("User document created in Firestore");

//     // Log activity
//     await logActivity({
//       userId: userRecord.uid,
//       type: "login",
//       description: "Account created",
//       status: "success"
//     });
//     console.log("Activity logged");

//     // Return the user ID, email, and role along with success message
//     return {
//       success: true,
//       message: "Registration successful!",
//       userId: userRecord.uid,
//       email: email,
//       role: "user"
//     };
//   } catch (error) {
//     console.error("Registration error:", error);
//     return {
//       success: false,
//       message: "An error occurred during registration. Please try again.",
//       errors: {
//         general: ["An error occurred during registration. Please try again."]
//       }
//     };
//   }
// }
"use server";

import bcryptjs from "bcryptjs";
import { adminAuth, adminDb } from "@/firebase/admin";
import { logActivity } from "@/firebase/utils/activity";
import { registerSchema } from "@/schemas/auth/register";
import type { RegisterState } from "@/types/auth";

// Functions: registerUser
// The registerUser function is used to register a new user account.
// It creates a new user in Firebase Auth and a user document in Firestore.

// REGISTRATION
export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  console.log("registerUser server action called", {
    formDataExists: formData ? true : false,
    prevState
  });

  // Extract form data
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  console.log("Form data extracted", {
    nameExists: !!name,
    emailExists: !!email,
    passwordExists: !!password,
    confirmPasswordExists: !!confirmPassword
  });

  // Validate using the schema
  const validationResult = registerSchema.safeParse({
    email,
    password,
    confirmPassword
  });

  if (!validationResult.success) {
    // Extract the first error message
    const errorMessage = validationResult.error.issues[0]?.message || "Invalid form data";
    return {
      success: false,
      message: errorMessage,
      errors: {
        general: [errorMessage]
      }
    };
  }

  try {
    console.log("Creating user in Firebase Auth");
    // Hash the password
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Create the user in Firebase Auth
    let userRecord;
    try {
      userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: name || email.split("@")[0] // Use email username as fallback
      });
      console.log("User created in Firebase Auth:", userRecord.uid);
    } catch (error: any) {
      console.error("Error creating user in Firebase Auth:", error);
      if (error.code === "auth/email-already-exists") {
        return {
          success: false,
          message: "Email already in use. Please try logging in instead.",
          errors: {
            email: ["Email already in use. Please try logging in instead."]
          }
        };
      }
      throw error;
    }

    // Check if this is the first user in the system (to assign admin role)
    console.log("Checking if this is the first user in the system");
    const usersSnapshot = await adminDb.collection("users").count().get();
    const isFirstUser = usersSnapshot.data().count === 0;
    const role = isFirstUser ? "admin" : "user";
    console.log(`User role determined: ${role} (isFirstUser: ${isFirstUser})`);

    // If this is the first user, set custom claims
    if (isFirstUser) {
      await adminAuth.setCustomUserClaims(userRecord.uid, { role: "admin" });
      console.log("Set admin custom claims for first user");
    }

    console.log("Creating user document in Firestore");
    // Create user document in Firestore with the hashed password
    await adminDb
      .collection("users")
      .doc(userRecord.uid)
      .set({
        name: name || email.split("@")[0], // Use email username as fallback
        email,
        role, // Use the determined role instead of hardcoding "user"
        passwordHash, // Store the hashed password
        createdAt: new Date()
      });
    console.log("User document created in Firestore");

    // Log activity
    await logActivity({
      userId: userRecord.uid,
      type: "login",
      description: "Account created",
      status: "success"
    });
    console.log("Activity logged");

    // Return the user ID, email, and role along with success message
    return {
      success: true,
      message: "Registration successful!",
      userId: userRecord.uid,
      email: email,
      role: role // Return the determined role instead of hardcoding "user"
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "An error occurred during registration. Please try again.",
      errors: {
        general: ["An error occurred during registration. Please try again."]
      }
    };
  }
}
