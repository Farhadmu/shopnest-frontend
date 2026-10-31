import { clientFetch, clientMutation } from "@/lib/core/client";

export type StockoutRiskLevel = "critical" | "warning" | "healthy" | "overstocked";

export interface DemandForecastPoint {
  date: string;
  historical?: number;
  forecasted: number;
  lowerBound: number;
  upperBound: number;
}

export interface ProductDemandMetrics {
  productId: string;
  title: string;
  sku: string;
  category: string;
  currentStock: number;
  unitPrice: number;
  costPrice: number;
  totalSoldHistory: number;
  dailyVelocity7d: number;
  dailyVelocity30d: number;
  dailyVelocityTrend: "increasing" | "stable" | "declining";
  trendPercentage: number;
  daysOfSupply: number;
  stockoutDate: string | null;
  stockoutRisk: StockoutRiskLevel;
  projectedDemandNext14d: number;
  projectedDemandNext30d: number;
  projectedRevenue30d: number;
  revenueAtRisk: number;
  reorderPoint: number;
  recommendedReorderQty: number;
  safetyStock: number;
  leadTimeDays: number;
  serviceLevelPercent: number;
  forecastPoints: DemandForecastPoint[];
}

export interface DemandIQOverview {
  storeName: string;
  totalTrackedProducts: number;
  criticalStockoutsCount: number;
  warningStockoutsCount: number;
  healthyStockCount: number;
  overstockedCount: number;
  totalInventoryUnits: number;
  totalInventoryValue: number;
  totalRevenueAtRisk30d: number;
  averageDaysOfSupply: number;
  topStockoutRisks: ProductDemandMetrics[];
  topRevenueGenerators: ProductDemandMetrics[];
  categoryBreakdown: Array<{
    category: string;
    productCount: number;
    velocity30d: number;
    stockoutRiskCount: number;
    inventoryValue: number;
  }>;
  macroFactors: {
    seasonalIndex: number;
    marketDemandPulse: "high" | "moderate" | "steady";
    supplyChainStressIndex: number;
  };
}

export type ShockScenarioType = "port_delay" | "demand_surge" | "climate_shock" | "supplier_delay";

export interface ShockSimulationParams {
  scenarioType: ShockScenarioType;
  delayDays?: number;
  demandMultiplier?: number;
  affectedCategory?: string;
}

export interface ShockSimulationResult {
  scenario: {
    type: ShockScenarioType;
    label: string;
    description: string;
    delayDays: number;
    demandMultiplier: number;
  };
  baselineStockoutCount: number;
  shockedStockoutCount: number;
  newStockoutsTriggered: number;
  baselineRevenueAtRisk: number;
  shockedRevenueAtRisk: number;
  additionalLostRevenue: number;
  impactedProducts: Array<{
    productId: string;
    title: string;
    category: string;
    currentStock: number;
    normalStockoutDays: number;
    shockedStockoutDays: number;
    gapDays: number;
    severity: "critical" | "warning";
    estimatedLostUnits: number;
    estimatedRevenueLoss: number;
  }>;
  mitigationPlaybook: Array<{
    step: number;
    action: string;
    expectedSavings: string;
    urgency: "immediate" | "high" | "medium";
  }>;
}

export interface ProcurementCitation {
  sku: string;
  title: string;
  currentStock: number;
  dailyVelocity: number;
  daysRemaining: number;
  recommendedReorderQty: number;
  revenueAtRisk: number;
}

export interface ProcurementChatResponse {
  answer: string;
  summaryPills?: Array<{ label: string; value: string; color: "red" | "amber" | "emerald" | "indigo" }>;
  citations: ProcurementCitation[];
  suggestedActions: Array<{
    title: string;
    actionType: "generate_po" | "simulate_shock" | "adjust_safety_stock" | "view_forecast";
    payload?: Record<string, unknown>;
  }>;
}

export interface PurchaseOrderItem {
  productId: string;
  sku: string;
  title: string;
  category: string;
  currentStock: number;
  dailyVelocity: number;
  daysOfSupply: number;
  reorderPoint: number;
  suggestedReorderQty: number;
  estimatedUnitCost: number;
  lineTotal: number;
  urgency: "critical" | "high" | "medium";
}

export interface PurchaseOrderProposal {
  poNumber: string;
  createdAt: string;
  validUntil: string;
  storeName: string;
  targetServiceLevel: string;
  leadTimeAssumptionDays: number;
  items: PurchaseOrderItem[];
  totalUnitsToOrder: number;
  totalEstimatedInvestment: number;
  totalProtectedRevenue: number;
  notes: string;
}

export async function getDemandIQOverview(): Promise<DemandIQOverview> {
  const res = await clientFetch<{ data: DemandIQOverview }>("/ai/demandiq/overview");
  return res.data;
}

export async function simulateShock(params: ShockSimulationParams): Promise<ShockSimulationResult> {
  const res = await clientMutation<{ data: ShockSimulationResult }>(
    "/ai/demandiq/simulate-shock",
    "POST",
    params
  );
  return res.data;
}

export async function askProcurementAnalyst(
  query: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<ProcurementChatResponse> {
  const res = await clientMutation<{ data: ProcurementChatResponse }>(
    "/ai/demandiq/procurement-chat",
    "POST",
    { query, conversationHistory }
  );
  return res.data;
}

export async function generatePurchaseOrder(options: {
  targetServiceLevel?: number;
  leadTimeDays?: number;
} = {}): Promise<PurchaseOrderProposal> {
  const res = await clientMutation<{ data: PurchaseOrderProposal }>(
    "/ai/demandiq/generate-po",
    "POST",
    options
  );
  return res.data;
}
