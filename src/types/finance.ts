export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  note?: string;
}

export interface ExpenseItem {
  id: string;
  groupId: string;
  name: string;
  price?: number;
  quantity?: number;
  amount: number; // total = price * quantity
  note?: string;
}

export interface ExpenseGroup {
  id: string;
  name: string;
  items: ExpenseItem[];
}

export interface MonthRecord {
  month: string; // "YYYY-MM"
  income: IncomeSource[];
  expenseGroups: ExpenseGroup[];
}
