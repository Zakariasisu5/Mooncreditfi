import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { toast } from "sonner";

const fetchAssetDetails = async (id) => {
  try {
    // Use CoinGecko API for asset details
    const [assetResponse, historyResponse] = await Promise.all([
      axios.get(`https://api.coingecko.com/api/v3/coins/${id}`),
      axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30`)
    ]);
    
    const asset = assetResponse.data;
    const historyData = historyResponse.data.prices.map(([timestamp, price]) => ({
      time: timestamp,
      priceUsd: price.toString()
    }));
    
    // Transform asset data to match previous structure
    return {
      asset: {
        id: asset.id,
        rank: asset.market_cap_rank,
        name: asset.name,
        symbol: asset.symbol.toUpperCase(),
        priceUsd: asset.market_data.current_price.usd.toString(),
        marketCapUsd: asset.market_data.market_cap.usd.toString(),
        changePercent24Hr: asset.market_data.price_change_percentage_24h?.toString() || '0',
        volumeUsd24Hr: asset.market_data.total_volume.usd.toString(),
        description: asset.description.en
      },
      history: historyData
    };
  } catch (error) {
    console.error('Error fetching asset details:', error);
    throw error;
  }
};

const AssetDetails = () => {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['assetDetails', id],
    queryFn: () => fetchAssetDetails(id),
  });

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('cryptoFavorites') || '[]');
    setIsFavorite(favorites.includes(id));
  }, [id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('cryptoFavorites') || '[]');
    if (isFavorite) {
      const updatedFavorites = favorites.filter(favId => favId !== id);
      localStorage.setItem('cryptoFavorites', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
      toast.success("Removed from favorites");
    } else {
      favorites.push(id);
      localStorage.setItem('cryptoFavorites', JSON.stringify(favorites));
      setIsFavorite(true);
      toast.success("Added to favorites");
    }
  };

  if (isLoading) return <div className="text-center mt-8 terminal-glow">Loading asset details...</div>;
  if (isError) return <div className="text-center mt-8 terminal-glow text-destructive">Error: Unable to fetch asset details</div>;

  const { asset, history } = data;

  const chartData = history.map(dataPoint => ({
    date: new Date(dataPoint.time),
    price: parseFloat(dataPoint.priceUsd)
  }));

  return (
    <div className="bg-background text-foreground p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold terminal-glow">{asset.name} ({asset.symbol})</h1>
        <button
          onClick={toggleFavorite}
          className="focus:outline-none"
        >
          <Star
            size={24}
            className={isFavorite ? "fill-yellow-500 text-yellow-500" : "text-gray-400"}
          />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <p><strong>Rank:</strong> {asset.rank}</p>
          <p><strong>Price:</strong> ${parseFloat(asset.priceUsd).toFixed(2)}</p>
          <p><strong>Market Cap:</strong> ${parseFloat(asset.marketCapUsd).toLocaleString()}</p>
          <p><strong>24h Change:</strong> <span className={parseFloat(asset.changePercent24Hr) >= 0 ? 'text-primary' : 'text-destructive'}>{parseFloat(asset.changePercent24Hr).toFixed(2)}%</span></p>
          <p><strong>Volume (24h):</strong> ${parseFloat(asset.volumeUsd24Hr).toLocaleString()}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-sm">{asset.description || "No description available."}</p>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4">Price History (Last 30 Days)</h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(date, 'MMM dd')}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(date) => format(date, 'MMM dd, yyyy')}
              formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
            />
            <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AssetDetails;
