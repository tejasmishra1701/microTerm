'use client';

import { useAccount, useDisconnect, useBalance, useConnect } from 'wagmi';
import { Wallet, ChevronDown, Power, Copy, Check, ExternalLink } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { injected } from 'wagmi/connectors';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get ETH balance
  const { data: balance } = useBalance({
    address: address,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleConnect = () => {
    try {
      connect({ connector: injected() });
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
    toast.success('Wallet disconnected');
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatBalance = (value: string | undefined) => {
    if (!value) return '0.00';
    const num = parseFloat(value);
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(4);
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        className="group relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 active:scale-95"
      >
        <Wallet className="w-4 h-4" />
        <span className="text-sm font-semibold">Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Connected Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="group relative inline-flex h-10 items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 font-medium text-white backdrop-blur-sm transition-all duration-200 hover:border-blue-500/50 hover:bg-white/10"
      >
        {/* Status Indicator */}
        <div className="relative">
          <div className="h-2 w-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
          <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-green-500 opacity-75" />
        </div>

        {/* Address & Balance */}
        <div className="flex flex-col items-start">
          <span className="text-xs font-mono leading-none text-slate-400">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          {balance && (
            <span className="text-[10px] font-semibold leading-none text-blue-400">
              {formatBalance(balance.formatted)} {balance.symbol}
            </span>
          )}
        </div>

        {/* Dropdown Indicator */}
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:text-white ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 animate-in fade-in slide-in-from-top-2 rounded-2xl border border-white/10 bg-[#0A0A0F] p-3 shadow-2xl backdrop-blur-xl">
          {/* Account Info */}
          <div className="mb-2 rounded-xl border border-white/5 bg-gradient-to-br from-blue-600/10 to-violet-600/10 px-3 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Connected Account</span>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-semibold text-green-400">Active</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm text-white">
                {address.slice(0, 8)}...{address.slice(-6)}
              </span>
              <button
                onClick={copyAddress}
                className="group rounded-lg bg-white/5 p-1.5 transition-colors hover:bg-white/10"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
                )}
              </button>
            </div>

            {balance && (
              <div className="mt-2 border-t border-white/5 pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-white">
                    {formatBalance(balance.formatted)}
                  </span>
                  <span className="text-xs font-medium text-slate-400">{balance.symbol}</span>
                </div>
              </div>
            )}
          </div>

          {/* View on Explorer */}
          <a
            href={`https://basescan.org/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-slate-300 transition-all duration-200 hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium">View on BaseScan</span>
          </a>

          {/* Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-3 py-2.5 font-semibold text-red-500 transition-all duration-200 hover:bg-red-500 hover:text-white"
          >
            <Power className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="text-sm">Disconnect Wallet</span>
          </button>
        </div>
      )}
    </div>
  );
}
