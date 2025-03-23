"use server";

/**
 * Convert object or array of objects to CSV string
 */
export async function objectToCSV(data: Record<string, unknown> | Record<string, unknown>[]): Promise<string> {
  const flattenedData = Array.isArray(data) ? data : [data];

  // Collect all unique keys across all objects
  const allKeys = new Set<string>();
  flattenedData.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });

  const headers = Array.from(allKeys);
  const csvRows = [headers.join(",")];

  flattenedData.forEach(item => {
    const values = headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) return "";

      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
      return `"${stringValue.replace(/"/g, '""')}"`; // Escape quotes
    });

    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
}
