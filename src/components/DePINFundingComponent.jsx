import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBlockNumber } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, Gift, Coins, Award, RefreshCw, ExternalLink, Loader2, CheckCircle2, Info } from 'lucide-react';
import { DEPIN_FINANCE_ADDRESS, DEPIN_FINANCE_ABI } from '@/hooks/useContract';

const DePINFundingComponent = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('0.01');
  const [isContributing, setIsContributing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const { data: blockNumber } = useBlockNumber({ watch: true });

  const { data: contributorData, refetch: refetchContributor, isLoading: isLoadingContributor } = useReadContract({
    address: DEPIN_FINANCE_ADDRESS,
    abi: DEPIN_FINANCE_ABI,
    functionName: 'getContributor',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: poolStats, refetch: refetchPoolStats, isLoading: isLoadingPool } = useReadContract({
    address: DEPIN_FINANCE_ADDRESS,
    abi: DEPIN_FINANCE_ABI,
    functionName: 'getPoolStats',
    query: { enabled: true }
  });

  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (blockNumber && address) { refetchContributor(); refetchPoolStats(); }
  }, [blockNumber, address, refetchContributor, refetchPoolStats]);

  useEffect(() => {
    if (isConfirmed) { refetchContributor(); refetchPoolStats(); setIsContributing(false); setIsClaiming(false); }
  }, [isConfirmed, refetchContributor, refetchPoolStats]);

  const userData = contributorData ? { shares: contributorData[0] ?? 0n, tokenId: contributorData[1] ?? 0n, pendingYield: contributorData[2] ?? 0n } : null;
  const pool = poolStats ? { totalShares: poolStats[0] ?? 0n, totalContributions: poolStats[1] ?? 0n, totalYieldsDistributed: poolStats[2] ?? 0n, availableBalance: poolStats[3] ?? 0n } : null;

  const handleContribute = async () => {
    if (!isConnected) { toast.error('Please connect your wallet first'); return; }
    if (parseFloat(amount) < 0.01) { toast.error('Minimum contribution is 0.01 CTC'); return; }
    setIsContributing(true);
    try {
      const hash = await writeContractAsync({ address: DEPIN_FINANCE_ADDRESS, abi: DEPIN_FINANCE_ABI, functionName: 'contribute', value: parseEther(amount) });
      toast.success('Transaction submitted!', { description: `Hash: ${hash.slice(0, 10)}...` });
    } catch (error) {
      setIsContributing(false);
      toast.error(error.message?.includes('User rejected') ? 'Transaction cancelled' : 'Contribution failed');
    }
  };

  const handleClaimYield = async () => {
    if (!userData || userData.pendingYield === 0n) { toast.error('No yield to claim'); return; }
    setIsClaiming(true);
    try {
      await writeContractAsync({ address: DEPIN_FINANCE_ADDRESS, abi: DEPIN_FINANCE_ABI, functionName: 'claimYield' });
      toast.success('Claiming yield...');
    } catch (error) {
      setIsClaiming(false);
      toast.error('Claim failed');
    }
  };

  const ownershipPercentage = userData && pool && pool.totalShares > 0n ? Number((userData.shares * 10000n) / pool.totalShares) / 100 : 0;

  if (!isConnected) return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center">Connect your wallet to contribute</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5 text-primary" />Fund DePIN Infrastructure</CardTitle>
          <CardDescription>Contribute CTC to earn yields and mint your Proof-of-Impact NFT</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-3">
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0.01" step="0.01" className="text-lg h-12" />
            <Button onClick={handleContribute} disabled={isContributing || isPending || isConfirming} className="h-12 px-6">
              {(isContributing || isPending || isConfirming) ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{isConfirming ? 'Confirming...' : 'Processing...'}</> : <><TrendingUp className="h-4 w-4 mr-2" />Contribute</>}
            </Button>
          </div>
          {txHash && <div className="flex items-center gap-2 text-sm"><a href={`https://creditcoin-testnet.blockscout.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View on Explorer <ExternalLink className="h-3 w-3 inline" /></a></div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" />Your Contribution</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {isLoadingContributor ? <Skeleton className="h-20 w-full" /> : userData ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Your Shares</p><p className="text-2xl font-bold">{formatEther(userData.shares)} CTC</p></div>
                <div><p className="text-sm text-muted-foreground">Ownership</p><p className="text-2xl font-bold">{ownershipPercentage.toFixed(2)}%</p></div>
              </div>
              {userData.tokenId > 0n && <Badge variant="secondary">NFT #{userData.tokenId.toString()}</Badge>}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div><p className="text-sm text-muted-foreground">Pending Yield</p><p className="text-xl font-bold text-green-600">{formatEther(userData.pendingYield)} CTC</p></div>
                <Button variant="outline" onClick={handleClaimYield} disabled={isClaiming || userData.pendingYield === 0n}>{isClaiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />} Claim</Button>
              </div>
            </>
          ) : <p className="text-center text-muted-foreground py-6">No contributions yet</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Pool Stats</CardTitle></CardHeader>
        <CardContent>
          {isLoadingPool ? <Skeleton className="h-20 w-full" /> : pool ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg"><p className="text-sm text-muted-foreground">Total Contributions</p><p className="text-lg font-bold">{formatEther(pool.totalContributions)} CTC</p></div>
              <div className="p-4 bg-muted/50 rounded-lg"><p className="text-sm text-muted-foreground">Yields Distributed</p><p className="text-lg font-bold text-green-600">{formatEther(pool.totalYieldsDistributed)} CTC</p></div>
            </div>
          ) : <p className="text-center text-muted-foreground">Unable to load pool stats</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default DePINFundingComponent;
