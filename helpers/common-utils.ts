/**
 * Utility methods relevant to the SDET automation suite.
 */
export class CommonUtils {
  static normalizePrice(text: string): number {
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  static generateDateFromToday(
    daysOffset = 0,
    format: 'YYYY-MM-DD' | 'MM/DD/YYYY' = 'YYYY-MM-DD',
  ): string {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return format === 'YYYY-MM-DD' ? `${yyyy}-${mm}-${dd}` : `${mm}/${dd}/${yyyy}`;
  }
}
