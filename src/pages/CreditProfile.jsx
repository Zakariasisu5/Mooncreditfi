import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/StatsCard';
import AICreditAnalysis from '@/components/AICreditAnalysis';
import { User, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import { useWalletContext } from '@/contexts/WalletContext';
import { CREDIT_PROFILE_ADDRESS, CREDIT_PROFILE_ABI } from '@/hooks/useContract';
import { formatEther } from 'viem';
import { useBlockNumber, useReadContract } from 'wagmi';

const CreditProfile = () => {
  const { account, isConnected } = useWalletContext();
  const [creditProfile, setCreditProfile] = useState({ 
    creditScore: 0, 
    borrowingHistory: [], 
    totalBorrowed: 0, 
    totalRepaid: 0, 
    availableCredit: 0, 
    utilizedCredit: 0 
  });
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Read profile data
  const { data: profileData, refetch: refetchProfile } = useReadContract({
    address: CREDIT_PROFILE_ADDRESS,
    abi: CREDIT_PROFILE_ABI,
    functionName: 'getProfile',
    args: account ? [account] : undefined,
    query: { enabled: !!account },
  });

  // Read loan history
  const { data: loanHistoryData, refetch: refetchHistory } = useReadContract({
    address: CREDIT_PROFILE_ADDRESS,
    abi: CREDIT_PROFILE_ABI,
    functionName: 'getLoanHistory',
    args: account ? [account] : undefined,
    query: { enabled: !!account },
  });

  // Read max borrow limit
  const { data: maxBorrowData } = useReadContract({
    address: CREDIT_PROFILE_ADDRESS,
    abi: CREDIT_PROFILE_ABI,
    functionName: 'getMaxBorrowLimit',
    args: account ? [account] : undefined,
    query: { enabled: !!account },
  });

  // Refresh on new blocks
  const { data: blockNumber } = useBlockNumber({ watch: true });
  useEffect(() => {
    if (blockNumber) {
      refetchProfile?.();
      refetchHistory?.();
    }
  }, [blockNumber]);

  // Update profile state when data changes
  useEffect(() => {
    if (profileData && loanHistoryData) {
      const [creditScore, totalLoans, repaidLoans, latePayments, totalBorrowed, totalRepaid] = profileData;
      
      const formattedHistory = Array.isArray(loanHistoryData) ? loanHistoryData.map((loan) => ({
        date: new Date(Number(loan.timestamp) * 1000).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' }),
        amount: parseFloat(formatEther(loan.amount)),
        status: loan.repaid ? 'repaid' : 'active',
        rate: Number(loan.interestRate) / 100,
      })) : [];

      setCreditProfile({
        creditScore: Number(creditScore) || 0,
        borrowingHistory: formattedHistory,
        totalBorrowed: parseFloat(formatEther(totalBorrowed)),
        totalRepaid: parseFloat(formatEther(totalRepaid)),
        availableCredit: maxBorrowData ? parseFloat(formatEther(maxBorrowData)) : 0,
        utilizedCredit: parseFloat(formatEther(totalBorrowed)) - parseFloat(formatEther(totalRepaid)),
      });
    }
  }, [profileData, loanHistoryData, maxBorrowData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'repaid': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const utilizationRate = creditProfile.availableCredit + creditProfile.utilizedCredit > 0
    ? (creditProfile.utilizedCredit / (creditProfile.availableCredit + creditProfile.utilizedCredit)) * 100
    : 0;

  // Prepare wallet data for AI analysis
  const walletDataForAI = useMemo(() => {
    if (!account) return null;
    
    const repaidLoans = creditProfile.borrowingHistory.filter(l => l.status === 'repaid').length;
    const totalLoans = creditProfile.borrowingHistory.length;
    const onTimeRate = totalLoans > 0 ? Math.round((repaidLoans / totalLoans) * 100) : 0;
    
    // Determine transaction frequency based on loan count
    let transactionFrequency = 'low';
    if (totalLoans >= 10) transactionFrequency = 'high';
    else if (totalLoans >= 3) transactionFrequency = 'medium';
    
    // Determine activity consistency
    let activityConsistency = 'consistent';
    if (totalLoans === 0) activityConsistency = 'new user';
    else if (creditProfile.utilizedCredit > creditProfile.availableCredit * 0.8) activityConsistency = 'high utilization';
    
    // Check for risk flags
    const riskFlags = [];
    if (utilizationRate > 80) riskFlags.push('High credit utilization');
    if (creditProfile.creditScore < 500) riskFlags.push('Low credit score');
    if (totalLoans > 0 && repaidLoans === 0) riskFlags.push('No repayment history');
    
    return {
      walletAddress: account,
      transactionFrequency,
      transactionCount: totalLoans,
      walletAge: Math.max(1, totalLoans * 2), // Estimate based on loan history
      totalVolume: (creditProfile.totalBorrowed + creditProfile.totalRepaid) * 1000, // Convert to USD estimate
      defiInteractions: totalLoans > 0,
      repaidLoans,
      totalLoans,
      onTimeRate,
      activityConsistency,
      riskFlags,
      currentCreditScore: creditProfile.creditScore,
      totalBorrowed: creditProfile.totalBorrowed * 1000, // USD estimate
      totalRepaid: creditProfile.totalRepaid * 1000, // USD estimate
    };
  }, [account, creditProfile, utilizationRate]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mooncreditfi-glow">Credit Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Credit Score"
          value={creditProfile.creditScore}
          description={creditProfile.creditScore >= 700 ? 'Excellent rating' : creditProfile.creditScore >= 600 ? 'Good rating' : 'Building credit'}
          icon={TrendingUp}
          trend={2.8}
          className="border-primary/20"
        />
        <StatsCard
          title="Available Credit"
          value={`${creditProfile.availableCredit.toFixed(4)} CTC`}
          description="Ready to borrow"
          icon={DollarSign}
        />
        <StatsCard
          title="Utilized Credit"
          value={`${creditProfile.utilizedCredit.toFixed(4)} CTC`}
          description="Currently borrowed"
          icon={CreditCard}
        />
        <StatsCard
          title="Utilization Rate"
          value={`${utilizationRate.toFixed(1)}%`}
          description="Credit utilization"
          icon={User}
        />
      </div>

      {/* AI Credit Analysis Section */}
      <AICreditAnalysis 
        walletData={walletDataForAI} 
        onAnalysisComplete={setAiAnalysis}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Credit Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used: {creditProfile.utilizedCredit.toFixed(4)} CTC</span>
                <span>Available: {creditProfile.availableCredit.toFixed(4)} CTC</span>
              </div>
              <Progress value={utilizationRate} className="h-3" />
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Credit Health Tips</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Keep utilization below 30% for optimal score</li>
                <li>• Pay loans on time to improve rating</li>
                <li>• Borrow and repay consistently to build history</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Score</p>
                <p className="text-4xl font-bold text-primary">{creditProfile.creditScore}</p>
              </div>
              <div className="text-right">
                <Badge variant={creditProfile.creditScore >= 700 ? 'default' : 'secondary'}>
                  {creditProfile.creditScore >= 750 ? 'Excellent' : creditProfile.creditScore >= 700 ? 'Good' : creditProfile.creditScore >= 600 ? 'Fair' : 'Building'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">Based on {creditProfile.borrowingHistory.length} loans</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Total Borrowed</p>
                <p className="font-bold">{creditProfile.totalBorrowed.toFixed(4)} CTC</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Total Repaid</p>
                <p className="font-bold text-green-500">{creditProfile.totalRepaid.toFixed(4)} CTC</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Borrowing History</CardTitle>
        </CardHeader>
        <CardContent>
          {creditProfile.borrowingHistory.length > 0 ? (
            <div className="space-y-4">
              {creditProfile.borrowingHistory.map((loan, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(loan.status)}>
                      {loan.status}
                    </Badge>
                    <div>
                      <p className="font-medium">{loan.amount.toFixed(4)} CTC</p>
                      <p className="text-sm text-muted-foreground">{loan.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{loan.rate}% APR</p>
                    <p className="text-sm text-muted-foreground">Interest Rate</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No borrowing history yet</p>
              <p className="text-sm">Borrow and repay to build your credit score</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditProfile;
