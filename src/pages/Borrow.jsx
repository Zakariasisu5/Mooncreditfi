import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useWalletContext } from '@/contexts/WalletContext';
import { useContract, LENDING_POOL_ADDRESS, LENDING_POOL_ABI, CREDIT_PROFILE_ADDRESS, CREDIT_PROFILE_ABI } from '@/hooks/useContract';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';
import { DollarSign, CreditCard, TrendingUp, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReadContract, useBlockNumber } from 'wagmi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { parseEther, formatEther } from 'viem';

const Borrow = () => {
  const { account, isConnected } = useWalletContext();
  const { writeContractAsync } = useContract();
  const { addNotification } = useNotifications();
  const [borrowAmount, setBorrowAmount] = useState('');
  const [activeLoan, setActiveLoan] = useState(null);
  const [activeLoanRaw, setActiveLoanRaw] = useState(null); // Store raw Wei values
  const [creditScore, setCreditScore] = useState(0);
  const [maxBorrowLimit, setMaxBorrowLimit] = useState('0');
  const [loanHistory, setLoanHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Read credit score from CreditProfile
  const { data: scoreData, refetch: refetchScore } = useReadContract({
    address: CREDIT_PROFILE_ADDRESS,
    abi: CREDIT_PROFILE_ABI,
    functionName: 'getScore',
    args: account ? [account] : undefined,
    query: { enabled: !!account },
  });

  // Read max borrow limit
  const { data: borrowLimitData, refetch: refetchBorrowLimit } = useReadContract({
    address: CREDIT_PROFILE_ADDRESS,
    abi: CREDIT_PROFILE_ABI,
    functionName: 'getMaxBorrowLimit',
    args: account ? [account] : undefined,
    query: { enabled: !!account },
  });

  // Read borrower loan from LendingPool
  const { data: borrowerLoan, refetch: refetchBorrowerLoan } = useReadContract({
    address: LENDING_POOL_ADDRESS,
    abi: LENDING_POOL_ABI,
    functionName: 'getBorrowerLoan',
    args: account ? [account] : undefined,
    query: { enabled: !!account },
  });

  // Read loan history from CreditProfile
  const { data: loanHistoryData, refetch: refetchLoanHistory } = useReadContract({
    address: CREDIT_PROFILE_ADDRESS,
    abi: CREDIT_PROFILE_ABI,
    functionName: 'getLoanHistory',
    args: account ? [account] : undefined,
    query: { enabled: !!account },
  });

  // Refresh on new blocks
  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    if (blockNumber) {
      refetchScore?.();
      refetchBorrowLimit?.();
      refetchBorrowerLoan?.();
      refetchLoanHistory?.();
    }
  }, [blockNumber]);

  // Update credit score
  useEffect(() => {
    if (scoreData !== undefined) {
      setCreditScore(Number(scoreData));
    }
  }, [scoreData]);

  // Update max borrow limit
  useEffect(() => {
    if (borrowLimitData !== undefined) {
      setMaxBorrowLimit(formatEther(borrowLimitData));
    }
  }, [borrowLimitData]);

  // Update active loan
  useEffect(() => {
    if (borrowerLoan) {
      const [amount, interestRate, isActive, totalOwed] = borrowerLoan;
      if (isActive) {
        // Store raw Wei values for transactions
        setActiveLoanRaw({
          amount: amount,
          totalOwed: totalOwed,
        });
        // Store formatted values for display
        setActiveLoan({
          amount: formatEther(amount),
          totalOwed: formatEther(totalOwed),
          interestRate: (Number(interestRate) / 100).toFixed(1),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        });
      } else {
        setActiveLoan(null);
        setActiveLoanRaw(null);
      }
    }
  }, [borrowerLoan]);

  // Update loan history
  useEffect(() => {
    if (loanHistoryData && Array.isArray(loanHistoryData)) {
      const formattedHistory = loanHistoryData.map((loan, index) => ({
        id: index,
        amount: formatEther(loan.amount),
        date: new Date(Number(loan.timestamp) * 1000).toLocaleDateString(),
        status: loan.repaid ? 'Repaid' : 'Active',
        onTime: loan.onTime,
      }));
      setLoanHistory(formattedHistory);
    }
  }, [loanHistoryData]);

  const handleBorrow = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(borrowAmount) > parseFloat(maxBorrowLimit)) {
      toast.error(`Amount exceeds your borrowing limit of ${parseFloat(maxBorrowLimit).toFixed(4)} CTC`);
      return;
    }

    if (creditScore < 500) {
      toast.error('Your credit score is too low to borrow. Minimum required: 500');
      return;
    }

    setIsLoading(true);
    try {
      const amountInWei = parseEther(borrowAmount);

      toast.info('Please confirm the transaction in your wallet...');

      const hash = await writeContractAsync({
        address: LENDING_POOL_ADDRESS,
        abi: LENDING_POOL_ABI,
        functionName: 'borrow',
        args: [amountInWei],
      });

      toast.success(`Transaction submitted! Hash: ${hash.slice(0, 10)}...`);
      toast.success(`Successfully borrowed ${borrowAmount} CTC`);
      addNotification(`Borrowed ${borrowAmount} CTC`, 'success');
      setBorrowAmount('');

      // Refresh data after delay
      setTimeout(() => {
        refetchScore?.();
        refetchBorrowLimit?.();
        refetchBorrowerLoan?.();
        refetchLoanHistory?.();
      }, 3000);
    } catch (error) {
      console.error('Borrow error:', error);
      if (error.message?.includes('User rejected') || error.message?.includes('rejected')) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('Credit score too low')) {
        toast.error('Credit score too low to borrow');
      } else if (error.message?.includes('Exceeds borrowing limit')) {
        toast.error('Amount exceeds your borrowing limit');
      } else if (error.message?.includes('CreditProfile not set')) {
        toast.error('Lending pool not properly configured');
      } else if (error.message?.includes('Insufficient pool liquidity')) {
        toast.error('Insufficient liquidity in the pool');
      } else if (error.message?.includes('Active loan exists')) {
        toast.error('You already have an active loan. Please repay first.');
      } else {
        toast.error('Failed to borrow: ' + (error.shortMessage || error.message || 'Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepay = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!activeLoan || !activeLoanRaw) {
      toast.error('No active loan to repay');
      return;
    }

    setIsLoading(true);
    try {
      // Add 1% buffer to account for interest accrued during transaction confirmation
      // The contract will refund any excess amount
      const baseAmount = activeLoanRaw.totalOwed;
      const buffer = baseAmount / 100n; // 1% buffer
      const amountToRepay = baseAmount + buffer;

      toast.info('Please confirm the transaction in your wallet...');

      const hash = await writeContractAsync({
        address: LENDING_POOL_ADDRESS,
        abi: LENDING_POOL_ABI,
        functionName: 'repay',
        value: amountToRepay,
      });

      toast.success(`Transaction submitted! Hash: ${hash.slice(0, 10)}...`);
      toast.success('Successfully repaid loan! Your credit score has been updated.');
      addNotification(`Repaid loan of ${activeLoan.totalOwed} CTC - Credit score updated`, 'success');

      // Refresh data after delay
      setTimeout(() => {
        refetchScore?.();
        refetchBorrowLimit?.();
        refetchBorrowerLoan?.();
        refetchLoanHistory?.();
      }, 3000);
    } catch (error) {
      console.error('Repay error:', error);
      if (error.message?.includes('User rejected') || error.message?.includes('rejected')) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds to repay the loan');
      } else if (error.message?.includes('Insufficient repayment amount')) {
        toast.error('Repayment amount is insufficient');
      } else {
        toast.error('Failed to repay: ' + (error.shortMessage || error.message || 'Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const getCreditScoreBadge = () => {
    if (creditScore >= 750) return { label: 'Excellent', variant: 'default' };
    if (creditScore >= 700) return { label: 'Good', variant: 'default' };
    if (creditScore >= 600) return { label: 'Fair', variant: 'secondary' };
    if (creditScore >= 500) return { label: 'Poor', variant: 'destructive' };
    return { label: 'No Score', variant: 'outline' };
  };

  const badge = getCreditScoreBadge();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-6xl mx-auto"
    >
      <div>
        <h1 className="text-3xl font-bold mb-2">Borrow & Build Credit</h1>
        <p className="text-muted-foreground">Access loans and improve your on-chain credit profile</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Borrow Form */}
        <motion.div variants={itemVariants}>
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Request Loan
              </CardTitle>
              <CardDescription>Borrow CTC based on your credit score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="borrow-amount">Amount (CTC)</Label>
                <Input
                  id="borrow-amount"
                  type="number"
                  placeholder="0.0"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
              </div>
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your Credit Score</span>
                  <span className="font-medium">{creditScore || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Borrowable</span>
                  <span className="font-medium">{parseFloat(maxBorrowLimit).toFixed(4)} CTC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span className="font-medium">5-12% APR</span>
                </div>
              </div>
              <Button
                onClick={handleBorrow}
                disabled={isLoading || !isConnected || !!activeLoan}
                className="w-full btn-mooncreditfi"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : activeLoan ? (
                  'Repay Current Loan First'
                ) : (
                  'Borrow'
                )}
              </Button>
              {!isConnected && (
                <p className="text-sm text-muted-foreground text-center">
                  Connect your wallet to borrow
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Loan Card */}
        <motion.div variants={itemVariants}>
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Active Loan
              </CardTitle>
              <CardDescription>Current loan status and details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeLoan ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">Borrowed</span>
                      <span className="font-bold text-lg">{parseFloat(activeLoan.amount).toFixed(4)} CTC</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">Interest Rate</span>
                      <span className="font-bold text-lg text-blue-500">{activeLoan.interestRate}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">Total to Repay</span>
                      <span className="font-bold text-lg text-orange-500">
                        {parseFloat(activeLoan.totalOwed).toFixed(6)} CTC
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <span className="text-sm font-medium">Due Date</span>
                      <span className="font-bold">{activeLoan.dueDate}</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleRepay}
                    disabled={isLoading || !isConnected}
                    className="w-full btn-mooncreditfi"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Repay Loan'
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-muted-foreground">No active loans</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Borrow CTC to build your credit score
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Credit Profile Card */}
      <motion.div variants={itemVariants}>
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Credit Profile
            </CardTitle>
            <CardDescription>Your on-chain credit score and loan history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Credit Score</p>
                <p className="text-4xl font-bold text-primary">{creditScore || 'N/A'}</p>
              </div>
              <div className="text-right">
                <Badge variant={badge.variant} className="mb-2">
                  {badge.label}
                </Badge>
                <p className="text-xs text-muted-foreground">Based on {loanHistory.length} loans</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Loan History</h4>
              {loanHistory.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount (CTC)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">On Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loanHistory.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">{loan.date}</TableCell>
                          <TableCell>{parseFloat(loan.amount).toFixed(4)}</TableCell>
                          <TableCell>
                            <Badge variant={loan.status === 'Repaid' ? 'default' : 'secondary'}>
                              {loan.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {loan.status === 'Repaid' ? (
                              loan.onTime ? (
                                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                              )
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">No loan history yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Take your first loan to start building credit
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Borrow;
