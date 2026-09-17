/**
 * نظام التأريخ الزمني الموحد الدقيق (Precision Timestamping System)
 * يضمن تسجيل كافة الأحداث والعمليات المدرسية بصيغة دقيقة بالثانية:
 * [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]
 */

export interface PrecisionTimeData {
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:MM:SS
  formatted: string; // [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]
  rawDate: Date;
  timestampMs: number;
}

export function getPrecisionTimeData(dateInput?: Date | string | number): PrecisionTimeData {
  const d = dateInput ? new Date(dateInput) : new Date();
  const pad = (n: number) => String(n).padStart(2, '0');

  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());

  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  const ss = pad(d.getSeconds());

  const dateStr = `${yyyy}-${mm}-${dd}`;
  const timeStr = `${hh}:${min}:${ss}`;
  const formatted = `[التاريخ: ${dateStr} | الوقت: ${timeStr}]`;

  return {
    dateStr,
    timeStr,
    formatted,
    rawDate: d,
    timestampMs: d.getTime(),
  };
}

/**
 * Returns string timestamp formatted strictly as:
 * [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]
 */
export function getPrecisionTimestamp(dateInput?: Date | string | number): string {
  return getPrecisionTimeData(dateInput).formatted;
}

export function formatPrecisionTimestamp(dateInput?: Date | string | number): string {
  return getPrecisionTimeData(dateInput).formatted;
}
