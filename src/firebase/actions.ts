// src/firebase/actions.ts

"use server";

import * as adminActivity from "./admin/activity";
import * as adminProducts from "./admin/products";
import * as adminUsers from "./admin/user";
import * as adminAuthFunctions from "./admin/auth";
//import * as adminOrders from "./admin/orders"; // You had this in ecommerce - keeping it
// import * as adminStorage from "./admin/storage"; // (still commented for now)

// ================= USER CRUD =================

export async function createUser(...args: Parameters<typeof adminAuthFunctions.createUserInFirebase>) {
  return await adminAuthFunctions.createUserInFirebase(...args);
}

export async function deleteUserAsAdmin(...args: Parameters<typeof adminAuthFunctions.deleteUserAsAdmin>) {
  return await adminAuthFunctions.deleteUserAsAdmin(...args);
}

export async function getUser(...args: Parameters<typeof adminAuthFunctions.getUser>) {
  return await adminAuthFunctions.getUser(...args);
}

export async function getUsers(...args: Parameters<typeof adminUsers.getUsers>) {
  return await adminUsers.getUsers(...args);
}

export async function updateUser(...args: Parameters<typeof adminAuthFunctions.updateUser>) {
  return await adminAuthFunctions.updateUser(...args);
}

export async function getUserByEmail(...args: Parameters<typeof adminAuthFunctions.getUserByEmail>) {
  return await adminAuthFunctions.getUserByEmail(...args);
}

export async function getUserFromToken(...args: Parameters<typeof adminAuthFunctions.getUserFromToken>) {
  return await adminAuthFunctions.getUserFromToken(...args);
}

export async function setCustomClaims(...args: Parameters<typeof adminAuthFunctions.setCustomClaims>) {
  return await adminAuthFunctions.setCustomClaims(...args);
}

export async function verifyIdToken(...args: Parameters<typeof adminAuthFunctions.verifyIdToken>) {
  return await adminAuthFunctions.verifyIdToken(...args);
}

// ================= USER PROFILE & ROLE =================

export async function createUserDocument(...args: Parameters<typeof adminUsers.createUserDocument>) {
  return await adminUsers.createUserDocument(...args);
}

export async function getUserProfile(...args: Parameters<typeof adminUsers.getUserProfile>) {
  return await adminUsers.getUserProfile(...args);
}

export async function updateUserProfile(...args: Parameters<typeof adminUsers.updateUserProfile>) {
  return await adminUsers.updateUserProfile(...args);
}

export async function getUserRole(...args: Parameters<typeof adminUsers.getUserRole>) {
  return await adminUsers.getUserRole(...args);
}

export async function setUserRole(...args: Parameters<typeof adminUsers.setUserRole>) {
  return await adminUsers.setUserRole(...args);
}

// ================= USER AUTHENTICATION =================

export async function verifyAndCreateUser(...args: Parameters<typeof adminAuthFunctions.verifyAndCreateUser>) {
  return await adminAuthFunctions.verifyAndCreateUser(...args);
}

// ================= CURRENT USER =================

export async function getCurrentUser(...args: Parameters<typeof adminUsers.getCurrentUser>) {
  return await adminUsers.getCurrentUser(...args);
}

// ================= EMAIL =================

export async function sendResetPasswordEmail(...args: Parameters<typeof adminAuthFunctions.sendResetPasswordEmail>) {
  return await adminAuthFunctions.sendResetPasswordEmail(...args);
}

// ================= PRODUCTS =================

export async function getAllProducts(...args: Parameters<typeof adminProducts.getAllProducts>) {
  return adminProducts.getAllProducts(...args);
}

export async function addProduct(...args: Parameters<typeof adminProducts.addProduct>) {
  return adminProducts.addProduct(...args);
}

export async function getProductById(...args: Parameters<typeof adminProducts.getProductById>) {
  return adminProducts.getProductById(...args);
}

export async function updateProduct(...args: Parameters<typeof adminProducts.updateProduct>) {
  return adminProducts.updateProduct(...args);
}

export async function deleteProduct(...args: Parameters<typeof adminProducts.deleteProduct>) {
  return adminProducts.deleteProduct(...args);
}

export async function getFeaturedProducts(...args: Parameters<typeof adminProducts.getFeaturedProducts>) {
  return adminProducts.getFeaturedProducts(...args);
}

// ================= ACTIVITY LOGS =================

export async function getAllActivityLogs(...args: Parameters<typeof adminActivity.getAllActivityLogs>) {
  return adminActivity.getAllActivityLogs(...args);
}

export async function getUserActivityLogs(...args: Parameters<typeof adminActivity.getUserActivityLogs>) {
  return adminActivity.getUserActivityLogs(...args);
}

export async function logActivity(...args: Parameters<typeof adminActivity.logActivity>) {
  return adminActivity.logActivity(...args);
}

// ================= HERO SLIDES =================

export async function getHeroSlidesFromFirestore(...args: Parameters<typeof adminProducts.getHeroSlidesFromFirestore>) {
  return adminProducts.getHeroSlidesFromFirestore(...args);
}
