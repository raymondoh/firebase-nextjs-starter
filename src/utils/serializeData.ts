// utils/serializeData.ts
// Helper function to ensure all data is properly serialized
export function serializeData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
