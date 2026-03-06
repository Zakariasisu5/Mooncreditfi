import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import StatsCard from '@/components/StatsCard';
import { useWalletContext } from '@/contexts/WalletContext';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';
import { parseEther, formatEther, parseAbiItem } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract, usePublicClient } from 'wagmi';
import { DollarSign, TrendingUp, Loader2, Shield, Award, ExternalLink, Search, Sun, Wifi, Car, Zap } from 'lucide-react';
import { DEPIN_FINANCE_ADDRESS, DEPIN_FINANCE_ABI } from '@/hooks/useContract';

const PROJECT_CATALOG = [
  {
    id: 'solar-grid-network',
    name: 'Solar Grid Network',
    category: 'Solar',
    description: 'Decentralized solar energy grid powering rural communities with blockchain-tracked energy credits.',
    roi: 12.5,
  },
  {
    id: 'community-wifi-mesh',
    name: 'Community WiFi Mesh',
    category: 'WiFi',
    description: 'Peer-to-peer WiFi network providing affordable internet access to underserved areas.',
    roi: 8.2,
  },
  {
    id: 'ev-charging-stations',
    name: 'EV Charging Stations',
    category: 'Mobility',
    description: 'Network of EV charging stations with tokenized rewards and revenue sharing.',
    roi: 15.0,
  },
  {
    id: 'smart-energy-storage',
    name: 'Smart Energy Storage',
    category: 'Energy Storage',
    description: 'Distributed battery storage network for renewable energy optimization and grid stability.',
    roi: 10.8,
  },
  {
    id: 'iot-sensor-network',
    name: 'IoT Sensor Network',
    category: 'IoT',
    description: 'Decentralized environmental monitoring sensors for air quality, weather, and pollution tracking.',
    roi: 9.5,
  },
  {
    id: 'smart-agriculture-sensors',
    name: 'Smart Agriculture Sensors',
    category: 'IoT',
    description: 'IoT-enabled soil and crop monitoring system for precision farming with a data marketplace.',
    roi: 11.2,
  },
  {
    id: '5g-telecom-towers',
    name: '5G Telecom Towers',
    category: 'Telecom',
    description: 'Community-owned 5G infrastructure with revenue sharing from network usage fees.',
    roi: 18.5,
  },
  {
    id: 'rural-connectivity-hub',
    name: 'Rural Connectivity Hub',
    category: 'Telecom',
    description: 'Satellite-linked communication hubs bringing internet to remote villages.',
    roi: 13.0,
  },
  {
    id: 'grid-battery-network',
    name: 'Grid Battery Network',
    category: 'Energy Storage',
    description: 'Large-scale battery facilities for peak demand management and energy arbitrage.',
    roi: 16.5,
  },
  {
    id: 'smart-city-sensors',
    name: 'Smart City Sensors',
    category: 'IoT',
    description: 'Traffic, parking, and utility monitoring sensors for urban efficiency optimization.',
    roi: 10.0,
  },
];

const categoryIcons = {
  Solar: Sun,
  WiFi: Wifi,
  Mobility: Car,
  IoT: Zap,
  'Energy Storage': Zap,
  Telecom: Wifi,
};

const DePINFinance = () => {
  const [contributeAmount, setContributeAmount] = useState('');
  const [contributeOpen, setContributeOpen] = useState(false);
  const [isContributing, setIsContributing] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectCategory, setProjectCategory] = useState('all');
  const [activity, setActivity] = useState([]);
  const [activityStatus, setActivityStatus] = useState({ loading: true, error: null });
  const { isConnected } = useWalletContext();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { addNotification } = useNotifications();
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isTxPending, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Fetch real pool stats from contract
  const { data: poolStats, refetch: refetchPoolStats } = useReadContract({
    address: DEPIN_FINANCE_ADDRESS,
    abi: DEPIN_FINANCE_ABI,
    functionName: 'getPoolStats',
    query: { enabled: true }
  });

  // Fetch contributor data from contract
  const { data: contributorData, refetch: refetchContributor } = useReadContract({
    address: DEPIN_FINANCE_ADDRESS,
    abi: DEPIN_FINANCE_ABI,
    functionName: 'getContributor',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Refresh frequently (but not every block)
  useEffect(() => {
    const id = setInterval(() => {
      refetchPoolStats?.();
      refetchContributor?.();
    }, 60_000);
    return () => clearInterval(id);
  }, [refetchPoolStats, refetchContributor]);

  // Parse pool stats
  const realPoolStats = poolStats ? {
    totalShares: formatEther(poolStats[0] ?? 0n),
    totalContributions: formatEther(poolStats[1] ?? 0n),
    totalYieldsDistributed: formatEther(poolStats[2] ?? 0n),
    availableBalance: formatEther(poolStats[3] ?? 0n),
  } : null;

  // Parse contributor data
  const userData = contributorData ? {
    shares: contributorData[0] ?? 0n,
    tokenId: contributorData[1] ?? 0n,
    pendingYield: contributorData[2] ?? 0n
  } : null;

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  useEffect(() => {
    if (isTxSuccess) {
      setIsContributing(false);
      setContributeAmount('');
      setContributeOpen(false);
      refetchPoolStats?.();
      refetchContributor?.();
    }
  }, [isTxSuccess, refetchPoolStats, refetchContributor]);

  const handleClaimYield = async () => {
    if (!userData || userData.pendingYield === 0n) {
      toast.error('No yield to claim');
      return;
    }
    
    try {
      const hash = await writeContractAsync({
        address: DEPIN_FINANCE_ADDRESS,
        abi: DEPIN_FINANCE_ABI,
        functionName: 'claimYield',
      });
      
      toast.success('Claiming yield...', {
        description: `Hash: ${hash.slice(0, 10)}...`,
        action: {
          label: 'View',
          onClick: () => window.open(`https://creditcoin-testnet.blockscout.com/tx/${hash}`, '_blank')
        }
      });
      addNotification('Claimed yield from DePIN pool', 'success');
    } catch (error) {
      console.error('Claim error:', error);
      if (error.message?.includes('User rejected')) {
        toast.error('Transaction cancelled');
      } else {
        toast.error('Claim failed: ' + (error.shortMessage || error.message));
      }
    }
  };

  const handleContribute = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!contributeAmount || parseFloat(contributeAmount) < 0.01) {
      toast.error('Minimum contribution is 0.01 CTC');
      return;
    }

    setIsContributing(true);
    try {
      toast.info('Submitting transaction to DePIN contract...');
      
      // Call smart contract contribute function (matches DEPIN.sol)
      const hash = await writeContractAsync({
        address: DEPIN_FINANCE_ADDRESS,
        abi: DEPIN_FINANCE_ABI,
        functionName: 'contribute',
        value: parseEther(contributeAmount.toString()),
      });
      
      toast.success('Transaction submitted!', {
        description: `Hash: ${hash.slice(0, 10)}...`,
        action: {
          label: 'View',
          onClick: () => window.open(`https://creditcoin-testnet.blockscout.com/tx/${hash}`, '_blank')
        }
      });
      addNotification(
        selectedProject
          ? `Contributed ${contributeAmount} CTC to DePIN pool (supporting: ${selectedProject.name})`
          : `Contributed ${contributeAmount} CTC to DePIN pool`,
        'success'
      );
    } catch (error) {
      console.error('Transaction error:', error);
      setIsContributing(false);
      if (error.message?.includes('User rejected')) {
        toast.error('Transaction cancelled by user');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient CTC balance');
      } else {
        toast.error('Transaction failed: ' + (error.shortMessage || error.message));
      }
    }
  };

  const projectCategories = useMemo(() => {
    const cats = new Set(PROJECT_CATALOG.map((p) => p.category));
    return Array.from(cats).sort((a, b) => a.localeCompare(b));
  }, []);

  const filteredProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    return PROJECT_CATALOG.filter((p) => {
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchesCategory = projectCategory === 'all' || p.category === projectCategory;
      return matchesQuery && matchesCategory;
    });
  }, [projectSearch, projectCategory]);

  const openContributeForProject = (project) => {
    setSelectedProject(project);
    setContributeAmount('0.01');
    setContributeOpen(true);
  };

  const compositionData = useMemo(() => {
    if (!realPoolStats) return [];
    const contributions = Math.max(0, Number(realPoolStats.totalContributions));
    const available = Math.max(0, Number(realPoolStats.availableBalance));
    const yields = Math.max(0, Number(realPoolStats.totalYieldsDistributed));
    return [
      { name: 'Total Contributions', value: contributions },
      { name: 'Available Balance', value: available },
      { name: 'Yields Distributed', value: yields },
    ].filter((x) => Number.isFinite(x.value) && x.value > 0);
  }, [realPoolStats]);

  // Load recent on-chain activity (no mocks/localStorage)
  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      if (!publicClient) return;
      setActivityStatus({ loading: true, error: null });

      try {
        const toBlock = await publicClient.getBlockNumber();
        const fromBlock = toBlock > 10_000n ? toBlock - 10_000n : 1n;

        const contributedEvent = parseAbiItem('event Contributed(address indexed contributor, uint256 amount)');
        const yieldClaimedEvent = parseAbiItem('event YieldClaimed(address indexed contributor, uint256 amount)');
        const yieldDistributedEvent = parseAbiItem('event YieldDistributed(uint256 amount)');
        const infraFundedEvent = parseAbiItem('event InfrastructureFunded(address indexed recipient, uint256 amount)');
        const nftMintedEvent = parseAbiItem('event NFTMinted(address indexed to, uint256 tokenId)');

        const [contributedLogs, yieldClaimedLogs, yieldDistributedLogs, infraLogs, nftLogs] = await Promise.all([
          publicClient.getLogs({ address: DEPIN_FINANCE_ADDRESS, event: contributedEvent, fromBlock, toBlock }),
          publicClient.getLogs({ address: DEPIN_FINANCE_ADDRESS, event: yieldClaimedEvent, fromBlock, toBlock }),
          publicClient.getLogs({ address: DEPIN_FINANCE_ADDRESS, event: yieldDistributedEvent, fromBlock, toBlock }),
          publicClient.getLogs({ address: DEPIN_FINANCE_ADDRESS, event: infraFundedEvent, fromBlock, toBlock }),
          publicClient.getLogs({ address: DEPIN_FINANCE_ADDRESS, event: nftMintedEvent, fromBlock, toBlock }),
        ]);

        const all = [];
        const pushLog = (kind, log, extra = {}) => {
          all.push({
            kind,
            blockNumber: log.blockNumber,
            logIndex: log.logIndex,
            txHash: log.transactionHash,
            args: log.args,
            ...extra,
          });
        };

        contributedLogs.forEach((l) => pushLog('Contributed', l));
        yieldClaimedLogs.forEach((l) => pushLog('YieldClaimed', l));
        yieldDistributedLogs.forEach((l) => pushLog('YieldDistributed', l));
        infraLogs.forEach((l) => pushLog('InfrastructureFunded', l));
        nftLogs.forEach((l) => pushLog('NFTMinted', l));

        all.sort((a, b) => {
          const bn = Number(b.blockNumber ?? 0n) - Number(a.blockNumber ?? 0n);
          if (bn !== 0) return bn;
          return Number(b.logIndex ?? 0n) - Number(a.logIndex ?? 0n);
        });

        const top = all.slice(0, 30);
        const uniqueBlocks = Array.from(new Set(top.map((x) => x.blockNumber).filter(Boolean)));
        const blockTs = new Map();
        await Promise.all(
          uniqueBlocks.map(async (bn) => {
            const blk = await publicClient.getBlock({ blockNumber: bn });
            blockTs.set(bn, Number(blk.timestamp));
          })
        );

        const normalized = top.map((e) => {
          const ts = e.blockNumber ? blockTs.get(e.blockNumber) : null;
          const contributor = e.args?.contributor ? String(e.args.contributor) : null;
          const recipient = e.args?.recipient ? String(e.args.recipient) : null;
          const to = e.args?.to ? String(e.args.to) : null;

          const amountWei = e.args?.amount ?? null;
          const amount = amountWei != null ? Number(formatEther(amountWei)) : null;
          const tokenId = e.args?.tokenId != null ? String(e.args.tokenId) : null;

          return {
            kind: e.kind,
            timestamp: ts,
            txHash: e.txHash ? String(e.txHash) : null,
            amount,
            contributor,
            recipient,
            to,
            tokenId,
          };
        });

        if (!cancelled) {
          setActivity(normalized);
          setActivityStatus({ loading: false, error: null });
        }
      } catch (e) {
        if (!cancelled) {
          setActivityStatus({
            loading: false,
            error: e instanceof Error ? e.message : 'Failed to load on-chain activity',
          });
        }
      }
    }

    loadActivity();
    const id = setInterval(loadActivity, 60_000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [publicClient]);

  // Use on-chain data for user stats
  const onChainShares = userData ? formatEther(userData.shares) : '0';
  const onChainPendingYield = userData ? formatEther(userData.pendingYield) : '0';
  const onChainTokenId = userData?.tokenId ?? 0n;
  
  // Calculate ownership percentage from on-chain data
  const ownershipPercent = userData && realPoolStats && parseFloat(realPoolStats.totalShares) > 0
    ? (parseFloat(onChainShares) / parseFloat(realPoolStats.totalShares)) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold mooncreditfi-glow">DePIN Finance</h1>
        <Badge variant="outline" className="text-sm">
          Decentralized Physical Infrastructure
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="TVL (On-Chain)"
          value={realPoolStats ? `${parseFloat(realPoolStats.totalContributions).toFixed(4)} CTC` : '0 CTC'}
          description="Total value locked in contract"
          icon={DollarSign}
          trend={15.2}
        />
        <StatsCard
          title="Yields Distributed"
          value={realPoolStats ? `${parseFloat(realPoolStats.totalYieldsDistributed).toFixed(4)} CTC` : '0 CTC'}
          description="Total rewards paid"
          icon={TrendingUp}
          trend={8.7}
        />
        <StatsCard
          title="Your Shares"
          value={`${parseFloat(onChainShares).toFixed(4)} CTC`}
          description={`${ownershipPercent.toFixed(2)}% ownership`}
          icon={Award}
        />
        <StatsCard
          title="Pending Yield"
          value={`${parseFloat(onChainPendingYield).toFixed(6)} CTC`}
          description="Claimable rewards"
          icon={TrendingUp}
          trend={parseFloat(onChainPendingYield) > 0 ? 12 : 0}
        />
      </div>

      {/* Contribute + Position */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Contribute to DePIN Pool
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={contributeOpen} onOpenChange={setContributeOpen}>
              <DialogTrigger asChild>
                <Button className="w-full btn-mooncreditfi" disabled={!isConnected}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Contribute
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {selectedProject ? `Support: ${selectedProject.name}` : 'Contribute to DePIN Pool'}
                  </DialogTitle>
                  <DialogDescription>
                    Your contribution goes into the DePIN pool contract. Shares and yield are tracked on-chain.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount (CTC)</label>
                    <Input
                      type="number"
                      placeholder="0.01"
                      step="0.01"
                      min="0.01"
                      value={contributeAmount}
                      onChange={(e) => setContributeAmount(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleContribute}
                    disabled={!contributeAmount || parseFloat(contributeAmount) <= 0 || isContributing || isPending || isTxPending}
                    className="w-full btn-mooncreditfi"
                  >
                    {(isContributing || isPending || isTxPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isTxPending ? 'Confirming...' : 'Processing...'}
                      </>
                    ) : (
                      'Confirm Contribution'
                    )}
                  </Button>
                  {txHash && (
                    <a
                      href={`https://creditcoin-testnet.blockscout.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm flex items-center gap-1"
                    >
                      View transaction <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {!isConnected ? (
              <p className="text-sm text-muted-foreground">Connect your wallet to contribute and track your position.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="card-glow border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Your On-Chain Position
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Your Shares</p>
              <p className="text-xl font-bold">{parseFloat(onChainShares).toFixed(4)} CTC</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Ownership</p>
              <p className="text-xl font-bold text-primary">{ownershipPercent.toFixed(2)}%</p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-sm text-muted-foreground">Pending Yield</p>
              <p className="text-xl font-bold text-green-500">{parseFloat(onChainPendingYield).toFixed(6)} CTC</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg flex flex-col justify-between">
              {onChainTokenId > 0n ? (
                <Badge variant="secondary" className="w-fit mb-2">NFT #{onChainTokenId.toString()}</Badge>
              ) : (
                <p className="text-sm text-muted-foreground mb-2">No NFT minted yet</p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClaimYield}
                disabled={!isConnected || isPending || isTxPending || parseFloat(onChainPendingYield) <= 0}
                className="w-full"
              >
                {(isPending || isTxPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Claim Yield'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Pool Composition (Live)</CardTitle>
          </CardHeader>
          <CardContent>
            {compositionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={compositionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {compositionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(4)} CTC`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No on-chain stats available yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Recent On-Chain Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityStatus.error ? (
              <div className="text-sm text-destructive">Failed to load activity: {activityStatus.error}</div>
            ) : null}
            {activityStatus.loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                {activity.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No recent activity found.</div>
                ) : (
                  activity.map((e, idx) => (
                    <div key={`${e.txHash ?? 'tx'}-${idx}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{e.kind}</Badge>
                          {e.timestamp ? (
                            <span className="text-xs text-muted-foreground">
                              {new Date(e.timestamp * 1000).toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {e.contributor ? `Contributor: ${e.contributor.slice(0, 6)}...${e.contributor.slice(-4)}` : null}
                          {e.recipient ? `Recipient: ${e.recipient.slice(0, 6)}...${e.recipient.slice(-4)}` : null}
                          {e.to ? `To: ${e.to.slice(0, 6)}...${e.to.slice(-4)}` : null}
                          {e.tokenId ? ` Token #${e.tokenId}` : null}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        {typeof e.amount === 'number' ? (
                          <div className="font-semibold">{e.amount.toFixed(4)} CTC</div>
                        ) : (
                          <div className="text-sm text-muted-foreground">—</div>
                        )}
                        {e.txHash ? (
                          <a
                            href={`https://creditcoin-testnet.blockscout.com/tx/${e.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-xs inline-flex items-center gap-1"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projects */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="Search projects..."
                className="pl-9"
              />
            </div>
            <Select value={projectCategory} onValueChange={setProjectCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {projectCategories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-sm text-muted-foreground">No projects match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredProjects.map((project) => {
                const Icon = categoryIcons[project.category] || Zap;
                return (
                  <Card key={project.id} className="card-glow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">{project.name}</CardTitle>
                        </div>
                        <Badge variant="outline">{project.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Target ROI</span>
                        <span className="font-semibold text-green-500">{project.roi.toFixed(1)}%</span>
                      </div>
                      <Button
                        className="w-full btn-mooncreditfi"
                        disabled={!isConnected}
                        onClick={() => openContributeForProject(project)}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Support via Pool
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DePINFinance;