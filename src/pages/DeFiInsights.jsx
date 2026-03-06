import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import StatsCard from '@/components/StatsCard';
import { LENDING_POOL_ADDRESS, LENDING_POOL_ABI, DEPIN_FINANCE_ADDRESS, DEPIN_FINANCE_ABI } from '@/hooks/useContract';
import { useReadContract, useBlockNumber, useWatchContractEvent, usePublicClient } from 'wagmi';
import { formatEther, parseAbiItem } from 'viem';
import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Droplets, Activity, BarChart3, PiggyBank, Coins } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DAY_SECONDS = 24 * 60 * 60;

function formatChartDay(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString().slice(5, 10);
}

const DeFiInsights = () => {
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const publicClient = usePublicClient();

  // Read pool stats from LendingPool contract
  const { data: poolStats, refetch: refetchPoolStats } = useReadContract({
    address: LENDING_POOL_ADDRESS,
    abi: LENDING_POOL_ABI,
    functionName: 'getPoolStats',
    query: { enabled: true }
  });

  // Read utilization from LendingPool
  const { data: utilization, refetch: refetchUtilization } = useReadContract({
    address: LENDING_POOL_ADDRESS,
    abi: LENDING_POOL_ABI,
    functionName: 'getUtilizationRate',
    query: { enabled: true }
  });

  // Read DePIN pool stats
  const { data: depinStats, refetch: refetchDepinStats } = useReadContract({
    address: DEPIN_FINANCE_ADDRESS,
    abi: DEPIN_FINANCE_ABI,
    functionName: 'getPoolStats',
    query: { enabled: true }
  });

  // Refetch on new blocks
  useEffect(() => {
    if (blockNumber) {
      refetchPoolStats();
      refetchUtilization();
      refetchDepinStats();
    }
  }, [blockNumber, refetchPoolStats, refetchUtilization, refetchDepinStats]);

  // Parse lending pool data with safe defaults
  const lendingPool = poolStats ? {
    totalDeposited: formatEther(poolStats[0] ?? 0n),
    totalBorrowed: formatEther(poolStats[1] ?? 0n),
    availableLiquidity: formatEther(poolStats[2] ?? 0n),
    utilizationRate: Number(poolStats[3] ?? 0n) / 100,
    currentAPY: Number(poolStats[4] ?? 0n) / 100,
  } : { totalDeposited: '0', totalBorrowed: '0', availableLiquidity: '0', utilizationRate: 0, currentAPY: 8.5 };

  // Parse DePIN data
  const depinPool = depinStats ? {
    totalShares: formatEther(depinStats[0] ?? 0n),
    totalContributions: formatEther(depinStats[1] ?? 0n),
    totalYieldsDistributed: formatEther(depinStats[2] ?? 0n),
    availableBalance: formatEther(depinStats[3] ?? 0n),
  } : null;

  // Calculate display values
  const lendingRateDisplay = `${lendingPool.currentAPY.toFixed(2)}%`;
  const borrowingRateDisplay = `${(lendingPool.currentAPY + 2).toFixed(2)}%`;
  const utilizationPercent = utilization != null ? Number(utilization) / 100 : lendingPool.utilizationRate;
  
  // Combined TVL (Lending + DePIN)
  const lendingTVL = parseFloat(lendingPool.totalDeposited);
  const depinTVL = depinPool ? parseFloat(depinPool.totalContributions) : 0;
  const totalTVL = lendingTVL + depinTVL;

  // Real-time counters from events
  const [activeLoansCount, setActiveLoansCount] = useState(0);
  const [dailyVolumeSum, setDailyVolumeSum] = useState(0);
  const [tx24hCount, setTx24hCount] = useState(0);

  const [chartData, setChartData] = useState([]);
  const [chartStatus, setChartStatus] = useState({ loading: true, error: null });
  
  useEffect(() => {
    let cancelled = false;

    async function buildLiveAnalytics() {
      if (!publicClient) return;

      setChartStatus({ loading: true, error: null });

      try {
        const toBlock = await publicClient.getBlockNumber();

        // Estimate block time to pick a reasonable fromBlock for "last 30 days"
        const sampleDelta = 500n;
        const fromSample = toBlock > sampleDelta ? toBlock - sampleDelta : 1n;
        const [bNow, bPast] = await Promise.all([
          publicClient.getBlock({ blockNumber: toBlock }),
          publicClient.getBlock({ blockNumber: fromSample }),
        ]);

        const nowTs = Number(bNow.timestamp);
        const pastTs = Number(bPast.timestamp);
        const dt = Math.max(1, nowTs - pastTs);
        const blocks = Number(toBlock - fromSample);
        const blockTimeSeconds = dt / Math.max(1, blocks);

        const days = 30;
        const approxBlocksBack = BigInt(Math.ceil((days * DAY_SECONDS) / Math.max(0.5, blockTimeSeconds)));
        const fromBlock = toBlock > approxBlocksBack ? toBlock - approxBlocksBack : 1n;

        const borrowedEvent = parseAbiItem('event Borrowed(address indexed borrower, uint256 amount, uint256 interestRate)');
        const repaidEvent = parseAbiItem('event Repaid(address indexed borrower, uint256 principal, uint256 interest)');
        const depositedEvent = parseAbiItem('event Deposited(address indexed lender, uint256 amount)');
        const withdrawnEvent = parseAbiItem('event Withdrawn(address indexed lender, uint256 amount, uint256 yield)');

        const [borrowLogs, repayLogs, depositLogs, withdrawLogs] = await Promise.all([
          publicClient.getLogs({ address: LENDING_POOL_ADDRESS, event: borrowedEvent, fromBlock, toBlock }),
          publicClient.getLogs({ address: LENDING_POOL_ADDRESS, event: repaidEvent, fromBlock, toBlock }),
          publicClient.getLogs({ address: LENDING_POOL_ADDRESS, event: depositedEvent, fromBlock, toBlock }),
          publicClient.getLogs({ address: LENDING_POOL_ADDRESS, event: withdrawnEvent, fromBlock, toBlock }),
        ]);

        const blockTsCache = new Map();
        const uniqueBlocks = new Set([
          ...borrowLogs.map((l) => l.blockNumber),
          ...repayLogs.map((l) => l.blockNumber),
          ...depositLogs.map((l) => l.blockNumber),
          ...withdrawLogs.map((l) => l.blockNumber),
        ]);

        await Promise.all(
          Array.from(uniqueBlocks).map(async (bn) => {
            if (bn == null) return;
            const block = await publicClient.getBlock({ blockNumber: bn });
            blockTsCache.set(bn, Number(block.timestamp));
          })
        );

        const dayStart = nowTs - days * DAY_SECONDS;
        const window24hStart = nowTs - DAY_SECONDS;
        const dayBuckets = new Map();
        for (let i = 0; i <= days; i += 1) {
          const ts = dayStart + i * DAY_SECONDS;
          dayBuckets.set(formatChartDay(ts), {
            date: formatChartDay(ts),
            volume: 0,
            loans: 0,
            netDeposits: 0,
            newLenders: new Set(),
            newBorrowers: new Set(),
          });
        }

        const addToDay = (bn, cb) => {
          const ts = blockTsCache.get(bn);
          if (ts == null) return;
          if (ts < dayStart - DAY_SECONDS) return;
          const key = formatChartDay(ts);
          const bucket = dayBuckets.get(key);
          if (!bucket) return;
          cb(bucket);
        };

        let volume24hBase = 0;
        let tx24hBase = 0;
        let borrowsInWindow = 0;
        let repaysInWindow = 0;

        borrowLogs.forEach((log) => {
          addToDay(log.blockNumber, (b) => {
            const amt = log.args?.amount ? Number(formatEther(log.args.amount)) : 0;
            b.volume += amt;
            b.loans += 1;
            if (log.args?.borrower) b.newBorrowers.add(String(log.args.borrower).toLowerCase());
          });

          const ts = blockTsCache.get(log.blockNumber);
          if (ts != null && ts >= window24hStart) {
            const amt = log.args?.amount ? Number(formatEther(log.args.amount)) : 0;
            volume24hBase += amt;
            tx24hBase += 1;
          }
        });

        repayLogs.forEach((log) => {
          addToDay(log.blockNumber, (b) => {
            const principal = log.args?.principal ? Number(formatEther(log.args.principal)) : 0;
            const interest = log.args?.interest ? Number(formatEther(log.args.interest)) : 0;
            b.volume += principal + interest;
          });

          const ts = blockTsCache.get(log.blockNumber);
          if (ts != null && ts >= window24hStart) {
            const principal = log.args?.principal ? Number(formatEther(log.args.principal)) : 0;
            const interest = log.args?.interest ? Number(formatEther(log.args.interest)) : 0;
            volume24hBase += principal + interest;
            tx24hBase += 1;
          }
        });

        depositLogs.forEach((log) => {
          addToDay(log.blockNumber, (b) => {
            const amt = log.args?.amount ? Number(formatEther(log.args.amount)) : 0;
            b.netDeposits += amt;
            if (log.args?.lender) b.newLenders.add(String(log.args.lender).toLowerCase());
          });
        });

        withdrawLogs.forEach((log) => {
          addToDay(log.blockNumber, (b) => {
            const amt = log.args?.amount ? Number(formatEther(log.args.amount)) : 0;
            b.netDeposits -= amt;
          });
        });

        // Anchor TVL series to current on-chain totalDeposited, then step backwards with netDeposits.
        const currentTVL = Number.isFinite(lendingTVL) && lendingTVL > 0 ? lendingTVL : 0;
        const ordered = Array.from(dayBuckets.values()).sort((a, b) => a.date.localeCompare(b.date));

        // Build cumulative unique users in-window (still live, but windowed)
        const lendersSet = new Set();
        const borrowersSet = new Set();

        // Reverse-cumulate TVL using netDeposits
        let tvlCursor = currentTVL;
        const tvlByDate = new Map();
        for (let i = ordered.length - 1; i >= 0; i -= 1) {
          const row = ordered[i];
          tvlByDate.set(row.date, tvlCursor);
          tvlCursor = Math.max(0, tvlCursor - row.netDeposits);
        }

        const finalData = ordered.map((row) => {
          row.newLenders.forEach((x) => lendersSet.add(x));
          row.newBorrowers.forEach((x) => borrowersSet.add(x));

          return {
            date: row.date,
            tvl: tvlByDate.get(row.date) ?? 0,
            lending: lendingPool.currentAPY,
            borrowing: lendingPool.currentAPY + 2,
            lenders: lendersSet.size,
            borrowers: borrowersSet.size,
            volume: row.volume,
            loans: row.loans,
          };
        });

        // Active loans estimate (windowed): track borrower state from Borrowed/Repaid ordering
        const loanStateByBorrower = new Map();
        const activity = [];

        borrowLogs.forEach((log) => {
          const borrower = log.args?.borrower ? String(log.args.borrower).toLowerCase() : null;
          const ts = blockTsCache.get(log.blockNumber);
          if (!borrower || ts == null) return;
          activity.push({ ts, kind: 'borrow', borrower, logIndex: Number(log.logIndex ?? 0n) });
        });

        repayLogs.forEach((log) => {
          const borrower = log.args?.borrower ? String(log.args.borrower).toLowerCase() : null;
          const ts = blockTsCache.get(log.blockNumber);
          if (!borrower || ts == null) return;
          activity.push({ ts, kind: 'repay', borrower, logIndex: Number(log.logIndex ?? 0n) });
        });

        activity.sort((a, b) => (a.ts - b.ts) || (a.logIndex - b.logIndex));
        activity.forEach((evt) => {
          loanStateByBorrower.set(evt.borrower, evt.kind === 'borrow');
        });

        const activeLoansLive = Array.from(loanStateByBorrower.values()).filter(Boolean).length;

        if (!cancelled) {
          setChartData(finalData);
          setDailyVolumeSum(volume24hBase);
          setTx24hCount(tx24hBase);
          setActiveLoansCount(activeLoansLive);
          setChartStatus({ loading: false, error: null });
        }
      } catch (e) {
        if (!cancelled) {
          setChartStatus({ loading: false, error: e instanceof Error ? e.message : 'Failed to load on-chain analytics' });
        }
      }
    }

    buildLiveAnalytics();
    const interval = setInterval(buildLiveAnalytics, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicClient, lendingTVL, lendingPool.currentAPY]);

  // Listen for Borrow events
  useWatchContractEvent({
    address: LENDING_POOL_ADDRESS,
    abi: LENDING_POOL_ABI,
    eventName: 'Borrowed',
    onLogs(logs) {
      logs.forEach(log => {
        try {
          const amount = log.args?.amount;
          if (amount) {
            const value = Number(formatEther(amount));
            setActiveLoansCount((n) => n + 1);
            setDailyVolumeSum((s) => s + value);
            setTx24hCount((c) => c + 1);
          }
        } catch (e) {
          console.warn('Error parsing Borrow event', e);
        }
      });
    },
  });

  // Listen for Repay events
  useWatchContractEvent({
    address: LENDING_POOL_ADDRESS,
    abi: LENDING_POOL_ABI,
    eventName: 'Repaid',
    onLogs(logs) {
      logs.forEach(log => {
        try {
          const principal = log.args?.principal;
          const interest = log.args?.interest;
          if (principal || interest) {
            const value = Number(formatEther(principal ?? 0n)) + Number(formatEther(interest ?? 0n));
            setActiveLoansCount((n) => Math.max(0, n - 1));
            setDailyVolumeSum((s) => s + value);
            setTx24hCount((c) => c + 1);
          }
        } catch (e) {
          console.warn('Error parsing Repay event', e);
        }
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold mooncreditfi-glow">DeFi Insights</h1>
        <div className="text-sm text-muted-foreground">
          Live on-chain analytics
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Lending APY"
          value={lendingRateDisplay}
          description="Current yield for lenders"
          icon={TrendingUp}
          trend={0.3}
        />
        <StatsCard
          title="Borrowing APR"
          value={borrowingRateDisplay}
          description="Current rate for borrowers"
          icon={DollarSign}
          trend={-0.2}
        />
        <StatsCard
          title="Active Loans"
          value={activeLoansCount > 0 ? activeLoansCount.toLocaleString() : '0'}
          description="Current active positions"
          icon={Users}
        />
        <StatsCard
          title="Total TVL"
          value={`${totalTVL.toFixed(4)} CTC`}
          description="Lending + DePIN combined"
          icon={Droplets}
          trend={12.5}
        />
      </div>

      {/* Protocol Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-primary" />
              Lending Pool Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Deposited</p>
                <p className="text-xl font-bold">{parseFloat(lendingPool.totalDeposited).toFixed(4)} CTC</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Borrowed</p>
                <p className="text-xl font-bold">{parseFloat(lendingPool.totalBorrowed).toFixed(4)} CTC</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Available Liquidity</p>
                <p className="text-xl font-bold">{parseFloat(lendingPool.availableLiquidity).toFixed(4)} CTC</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Utilization</p>
                <p className="text-xl font-bold">{utilizationPercent.toFixed(1)}%</p>
                <Progress value={utilizationPercent} className="mt-1 h-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              DePIN Finance Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Contributions</p>
                <p className="text-xl font-bold">{depinPool ? parseFloat(depinPool.totalContributions).toFixed(4) : '0'} CTC</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Yields Distributed</p>
                <p className="text-xl font-bold text-green-500">{depinPool ? parseFloat(depinPool.totalYieldsDistributed).toFixed(4) : '0'} CTC</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Shares</p>
                <p className="text-xl font-bold">{depinPool ? parseFloat(depinPool.totalShares).toFixed(4) : '0'} CTC</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-xl font-bold">{depinPool ? parseFloat(depinPool.availableBalance).toFixed(4) : '0'} CTC</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidity Pools</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>Lending Pool Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Liquidity Utilization</span>
                    <span>{utilizationPercent.toFixed(1)}%</span>
                  </div>
                  <Progress value={utilizationPercent} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Available Liquidity</span>
                    <span>{parseFloat(lendingPool.availableLiquidity).toFixed(4)} CTC</span>
                  </div>
                  <Progress value={100 - utilizationPercent} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>24h Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Volume</p>
                    <p className="text-2xl font-bold">
                      {dailyVolumeSum > 0 ? `${dailyVolumeSum.toFixed(4)} CTC` : '0 CTC'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-bold">{tx24hCount}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Protocol Health</p>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-green-500">Operational</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="liquidity" className="space-y-4">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle>Liquidity Pool Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Pool Size</p>
                    <p className="text-xl font-bold">{parseFloat(lendingPool.totalDeposited).toFixed(4)} CTC</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">APY</p>
                    <p className="text-xl font-bold text-green-500">{lendingRateDisplay}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Borrowed</p>
                    <p className="text-xl font-bold">{parseFloat(lendingPool.totalBorrowed).toFixed(4)} CTC</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  TVL Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartStatus.error ? (
                  <div className="text-sm text-destructive">
                    Failed to load live analytics: {chartStatus.error}
                  </div>
                ) : null}
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `${value.toFixed(2)}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${value.toFixed(4)} CTC`, 'TVL']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tvl" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fill="url(#tvlGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Lending & Borrowing Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${value.toFixed(2)}%`, '']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="lending" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      name="Lending APY"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="borrowing" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      name="Borrowing APR"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="lenders" 
                      fill="hsl(var(--chart-3))" 
                      name="Lenders"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="borrowers" 
                      fill="hsl(var(--chart-4))" 
                      name="Borrowers"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Volume & Loans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="volume" 
                      stroke="hsl(var(--chart-5))" 
                      strokeWidth={2}
                      fill="url(#volumeGradient)"
                      name="Volume"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="loans" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      name="Loans"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeFiInsights;