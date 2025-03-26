// utils/serializeData.ts

// Enhanced serialization to handle Firestore Timestamps and Dates
export function serializeData<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (value && typeof value === "object" && value.seconds !== undefined && value.nanoseconds !== undefined) {
        // Firestore Timestamp -> ISO string
        return new Date(value.seconds * 1000 + value.nanoseconds / 1000000).toISOString();
      }

      if (value instanceof Date) {
        return value.toISOString();
      }

      return value;
    })
  );
}
