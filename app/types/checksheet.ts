export interface ChecksheetEntry {
  id: number;
  user: string;
  department: string;
  line: string;
  category: string;
  dayType: string;
  item: string;
  judgment: "OK" | "NG" | "";
  reason: string;
  date: string;
  planCountermeasureDate?: string;
  status: "draft" | "submitted" | "OK" | "NG";
}
