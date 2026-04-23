import { useEffect, useRef } from "react";
import { TrendingUp, BarChart3, Activity } from "lucide-react";

// TradingView ticker tape + mini charts via widgets
export function LiveChartsSection() {
  const tickerRef = useRef<HTMLDivElement>(null);
  const chartCryptoRef = useRef<HTMLDivElement>(null);
  const chartStockRef = useRef<HTMLDivElement>(null);
  const chartForexRef = useRef<HTMLDivElement>(null);

  // Inject TradingView ticker tape
  useEffect(() => {
    if (!tickerRef.current) return;
    tickerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
        { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
        { proName: "COINBASE:SOLUSD", title: "Solana" },
        { proName: "FOREXCOM:XAUUSD", title: "Gold/USD" },
        { proName: "NASDAQ:AAPL", title: "Apple" },
        { proName: "NASDAQ:TSLA", title: "Tesla" },
        { proName: "NASDAQ:NVDA", title: "NVIDIA" },
        { proName: "FX:EURUSD", title: "EUR/USD" },
        { proName: "FX:GBPUSD", title: "GBP/USD" },
        { proName: "COINBASE:XRPUSD", title: "XRP" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en",
    });
    tickerRef.current.appendChild(script);
  }, []);

  // Inject mini chart — Bitcoin
  useEffect(() => {
    if (!chartCryptoRef.current) return;
    chartCryptoRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: "BITSTAMP:BTCUSD",
      width: "100%",
      height: "220",
      locale: "en",
      dateRange: "1M",
      colorTheme: "dark",
      isTransparent: true,
      autosize: true,
      largeChartUrl: "",
    });
    chartCryptoRef.current.appendChild(script);
  }, []);

  // Inject mini chart — Gold
  useEffect(() => {
    if (!chartStockRef.current) return;
    chartStockRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: "FOREXCOM:XAUUSD",
      width: "100%",
      height: "220",
      locale: "en",
      dateRange: "1M",
      colorTheme: "dark",
      isTransparent: true,
      autosize: true,
    });
    chartStockRef.current.appendChild(script);
  }, []);

  // Inject mini chart — S&P 500
  useEffect(() => {
    if (!chartForexRef.current) return;
    chartForexRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: "NASDAQ:NVDA",
      width: "100%",
      height: "220",
      locale: "en",
      dateRange: "1M",
      colorTheme: "dark",
      isTransparent: true,
      autosize: true,
    });
    chartForexRef.current.appendChild(script);
  }, []);

  return (
    <section id="markets" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Live Markets</p>
          <h2 className="mt-3 font-display text-4xl lg:text-5xl">
            Real-time <span className="text-gradient-gold">market pulse</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            We trade across crypto, commodities, equities and forex — 24/7.
            Watch the markets we operate in, live.
          </p>
        </div>

        {/* Ticker tape */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur">
          <div className="tradingview-widget-container" ref={tickerRef} />
        </div>

        {/* Market stat pills */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: TrendingUp, label: "Crypto", sub: "BTC · ETH · SOL · XRP", color: "text-accent" },
            { icon: BarChart3, label: "Equities", sub: "AAPL · TSLA · NVDA · SPY", color: "text-primary" },
            { icon: Activity, label: "Forex", sub: "EUR/USD · GBP/USD · JPY", color: "text-success" },
            { icon: BarChart3, label: "Commodities", sub: "Gold · Silver · Oil", color: "text-warning" },
          ].map((m) => (
            <div
              key={m.label}
              className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-4 backdrop-blur shadow-flash-emerald"
            >
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 ${m.color}`}>
                <m.icon size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold">{m.label}</div>
                <div className="text-[10px] text-muted-foreground">{m.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Mini charts grid */}
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            { ref: chartCryptoRef, label: "Bitcoin / USD", tag: "Crypto" },
            { ref: chartStockRef, label: "Gold / USD", tag: "Commodity" },
            { ref: chartForexRef, label: "NVIDIA Corp", tag: "Equity" },
          ].map((c) => (
            <div
              key={c.label}
              className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur shadow-flash-emerald"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-2">
                <div>
                  <div className="font-display text-lg">{c.label}</div>
                  <div className="text-[10px] uppercase tracking-wider text-primary">{c.tag}</div>
                </div>
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/15">
                  <Activity size={14} className="text-primary" />
                </div>
              </div>
              <div
                className="tradingview-widget-container"
                ref={c.ref}
                style={{ minHeight: 220 }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
