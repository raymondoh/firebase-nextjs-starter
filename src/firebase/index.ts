// // src/firebase/index.ts

// export {
//   // Auth
//   getCurrentUser,
//   getUserFromToken,
//   verifyIdToken,
//   sendResetPasswordEmail,
//   verifyAndCreateUser,
//   setCustomClaims,

//   // User
//   getUser,
//   getUserByEmail,
//   createUser,
//   //deleteUser,
//   updateUser,
//   createUserDocument,
//   getUsers,
//   setUserRole,
//   getUserRole,
//   getUserProfile,
//   updateUserProfile,
//   deleteUserAsAdmin,
//   // Activity
//   logActivity,
//   getUserActivityLogs,
//   getAllActivityLogs,

//   // Products
//   getAllProducts,
//   addProduct,
//   getProductById,
//   updateProduct,
//   deleteProduct,
//   getFeaturedProducts,
//   getHeroSlidesFromFirestore
// } from "./actions";
// src/firebase/index.ts

// ========== Auth ==========
export {
  getCurrentUser,
  getUserFromToken,
  verifyIdToken,
  sendResetPasswordEmail,
  verifyAndCreateUser,
  setCustomClaims
} from "./actions";

// ========== User ==========
export {
  createUser,
  deleteUserAsAdmin,
  updateUser,
  getUser,
  getUserByEmail,
  createUserDocument,
  getUsers,
  getUserRole,
  setUserRole,
  getUserProfile,
  updateUserProfile
} from "./actions";

// ========== Activity Logs ==========
export { logActivity, getUserActivityLogs, getAllActivityLogs } from "./actions";

// ========== Products ==========
export {
  getAllProducts,
  addProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getHeroSlidesFromFirestore
} from "./actions";
