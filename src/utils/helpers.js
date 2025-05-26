// دالة لتحويل جميع كائنات Timestamp في أي مستوى من التداخل
export const serializeTimestamps = (data) => {
  if (!data) return data;
  
  // تحويل كائن Timestamp
  if (data && typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }
  
  // تحويل كائن Timestamp بتنسيق Firestore (seconds, nanoseconds)
  if (data && typeof data === 'object' && 'seconds' in data && 'nanoseconds' in data) {
    return new Date(data.seconds * 1000 + data.nanoseconds / 1000000).toISOString();
  }
  
  // تحويل المصفوفات
  if (Array.isArray(data)) {
    return data.map(item => serializeTimestamps(item));
  }
  
  // تحويل الكائنات
  if (typeof data === 'object' && data !== null) {
    const result = {};
    for (const key in data) {
      result[key] = serializeTimestamps(data[key]);
    }
    return result;
  }
  
  return data;
};