export type BillType = 'LUCE' | 'GAS';

export interface Bill {
  id: string;
  type: BillType;
  customerName?: string;
  date: string;
  periodLabel: string;
  totalAmount: number;
  consumption: number;
  unitCost: number;
  fixedCosts: number;
  variableCosts: number;
  tvLicenseFee?: number;
  provider: string;
  pdfName: string;
  tips?: string[];
}

export interface AnalysisResult {
  type: BillType;
  customerName?: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  consumption: number;
  provider: string;
  details: {
    fixedCosts: number;
    variableCosts: number;
    unitCost: number;
  };
  tvLicenseFee?: number;
  tips: string[];
}

export interface ConsumptionTrend {
  month: string;
  amount: number;
  consumption: number;
}
