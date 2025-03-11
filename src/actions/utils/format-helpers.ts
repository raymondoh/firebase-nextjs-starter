"use server";

// Convert object to CSV string
export async function objectToCSV(data: any): string {
  // Get all unique keys from all objects
  const allKeys = new Set<string>();
  const flattenedData = Array.isArray(data) ? data : [data];

  flattenedData.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });

  const headers = Array.from(allKeys);
  const csvRows = [headers.join(",")];

  flattenedData.forEach(item => {
    const values = headers.map(header => {
      const value = item[header];
      // Handle values that might contain commas or quotes
      if (value === null || value === undefined) return "";
      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
}
