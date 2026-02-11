// Mock data for MoonCreditFi dashboard

export const mockMoonCreditFiData = {
  defiInsights: {
    lendingRate: 5.2,
    borrowingRate: 7.8,
    totalValueLocked: 45000000,
    activeLoans: 1247,
    liquidityPool: 12500000,
    dailyVolume: 850000
  },
  
  creditProfile: {
    creditScore: 742,
    borrowingHistory: [
      { date: '2024-01', amount: 5000, status: 'repaid', rate: 6.5 },
      { date: '2024-02', amount: 8000, status: 'repaid', rate: 6.2 },
      { date: '2024-03', amount: 12000, status: 'active', rate: 5.8 },
    ],
    availableCredit: 25000,
    utilizedCredit: 12000
  },
  
  depinFinance: {
    solarCredits: { funded: 145, totalValue: 2800000 },
    wifiCredits: { funded: 89, totalValue: 1200000 },
    mobilityCredits: { funded: 67, totalValue: 950000 },
    totalFinanced: 4950000,
    activeProjects: 301,
    averageROI: 8.4
  }
};

export const mockChartData = {
  priceHistory: [
    { date: '2024-01-01', price: 0.45 },
    { date: '2024-01-02', price: 0.48 },
    { date: '2024-01-03', price: 0.52 },
    { date: '2024-01-04', price: 0.49 },
    { date: '2024-01-05', price: 0.55 },
    { date: '2024-01-06', price: 0.58 },
    { date: '2024-01-07', price: 0.62 }
  ],
  
  creditScoreHistory: [
    { month: 'Jan', score: 680 },
    { month: 'Feb', score: 695 },
    { month: 'Mar', score: 710 },
    { month: 'Apr', score: 725 },
    { month: 'May', score: 742 }
  ],
  
  depinGrowth: [
    { category: 'Solar', value: 2800000 },
    { category: 'WiFi', value: 1200000 },
    { category: 'Mobility', value: 950000 },
    { category: 'Other', value: 500000 }
  ],
  
  tvlHistory: [
    { date: '2024-01', tvl: 35000000, lenders: 1200, borrowers: 450 },
    { date: '2024-02', tvl: 38000000, lenders: 1350, borrowers: 520 },
    { date: '2024-03', tvl: 40000000, lenders: 1500, borrowers: 600 },
    { date: '2024-04', tvl: 42500000, lenders: 1680, borrowers: 720 },
    { date: '2024-05', tvl: 45000000, lenders: 1850, borrowers: 850 }
  ],
  
  rateHistory: [
    { date: '2024-01', lending: 4.8, borrowing: 8.2 },
    { date: '2024-02', lending: 5.0, borrowing: 8.0 },
    { date: '2024-03', lending: 5.1, borrowing: 7.9 },
    { date: '2024-04', lending: 5.3, borrowing: 7.8 },
    { date: '2024-05', lending: 5.2, borrowing: 7.8 }
  ],
  
  volumeHistory: [
    { date: '2024-01', volume: 650000, loans: 180 },
    { date: '2024-02', volume: 720000, loans: 210 },
    { date: '2024-03', volume: 780000, loans: 245 },
    { date: '2024-04', volume: 820000, loans: 270 },
    { date: '2024-05', volume: 850000, loans: 290 }
  ]
};