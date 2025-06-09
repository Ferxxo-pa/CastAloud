import { ethers } from "ethers";
import axios from "axios";
import fs from "fs";
import path from "path";

// Payment configuration
export const PAYMENT_CONFIG = {
  PAYMENT_ADDRESS: "0x742d35Cc6634C0532925a3b8D59A6e656b992e08", // Your payment address
  REQUIRED_AMOUNT_USDC: "5", // 5 USDC
  REQUIRED_AMOUNT_ETH: "0.002", // 0.002 ETH alternative
  SUBSCRIPTION_DURATION_MONTHS: 12,
  NETWORKS: {
    mainnet: "https://api.etherscan.io/api",
    base: "https://api.basescan.org/api",
  }
};

interface PaidUser {
  fid: number;
  walletAddress: string;
  txHash: string;
  amount: string;
  currency: string;
  paidAt: string;
  expiresAt: string;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  blockNumber: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
}

// In-memory storage for paid users (replace with actual DB in production)
class PaymentStorage {
  private paidUsersFile = path.join(process.cwd(), 'paidUsers.json');
  
  getPaidUsers(): PaidUser[] {
    try {
      if (fs.existsSync(this.paidUsersFile)) {
        const data = fs.readFileSync(this.paidUsersFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading paid users file:', error);
    }
    return [];
  }
  
  savePaidUsers(users: PaidUser[]): void {
    try {
      fs.writeFileSync(this.paidUsersFile, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error('Error saving paid users file:', error);
    }
  }
  
  addPaidUser(user: PaidUser): void {
    const users = this.getPaidUsers();
    // Remove existing entry for same FID or wallet
    const filteredUsers = users.filter(u => u.fid !== user.fid && u.walletAddress !== user.walletAddress);
    filteredUsers.push(user);
    this.savePaidUsers(filteredUsers);
  }
  
  isPremiumUser(fid: number, walletAddress?: string): boolean {
    const users = this.getPaidUsers();
    const user = users.find(u => u.fid === fid || (walletAddress && u.walletAddress === walletAddress));
    
    if (!user) return false;
    
    // Check if subscription has expired
    const expiresAt = new Date(user.expiresAt);
    const now = new Date();
    
    return now < expiresAt;
  }
  
  getUserSubscription(fid: number, walletAddress?: string): PaidUser | null {
    const users = this.getPaidUsers();
    return users.find(u => u.fid === fid || (walletAddress && u.walletAddress === walletAddress)) || null;
  }
}

export const paymentStorage = new PaymentStorage();

// Verify payment on-chain
export async function verifyPayment(
  walletAddress: string, 
  network: 'mainnet' | 'base' = 'mainnet'
): Promise<{ verified: boolean; transaction?: Transaction; error?: string }> {
  try {
    const apiKey = process.env.ETHERSCAN_API_KEY || "YourEtherscanApiKey";
    const baseUrl = PAYMENT_CONFIG.NETWORKS[network];
    
    // Check ETH transactions
    const ethResponse = await axios.get(baseUrl, {
      params: {
        module: 'account',
        action: 'txlist',
        address: PAYMENT_CONFIG.PAYMENT_ADDRESS,
        startblock: 0,
        endblock: 99999999,
        sort: 'desc',
        apikey: apiKey
      }
    });
    
    if (ethResponse.data.status === '1') {
      const ethTxs = ethResponse.data.result;
      
      // Look for ETH payment from the wallet in last 24 hours
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      const recentEthTx = ethTxs.find((tx: Transaction) => {
        const txTime = parseInt(tx.timeStamp) * 1000;
        const txValue = ethers.formatEther(tx.value);
        
        return (
          tx.from.toLowerCase() === walletAddress.toLowerCase() &&
          tx.to.toLowerCase() === PAYMENT_CONFIG.PAYMENT_ADDRESS.toLowerCase() &&
          parseFloat(txValue) >= parseFloat(PAYMENT_CONFIG.REQUIRED_AMOUNT_ETH) &&
          txTime > oneDayAgo
        );
      });
      
      if (recentEthTx) {
        return { verified: true, transaction: recentEthTx };
      }
    }
    
    // Check USDC token transfers (ERC-20)
    const usdcResponse = await axios.get(baseUrl, {
      params: {
        module: 'account',
        action: 'tokentx',
        address: PAYMENT_CONFIG.PAYMENT_ADDRESS,
        startblock: 0,
        endblock: 99999999,
        sort: 'desc',
        apikey: apiKey
      }
    });
    
    if (usdcResponse.data.status === '1') {
      const tokenTxs = usdcResponse.data.result;
      
      // Look for USDC payment
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      const recentUsdcTx = tokenTxs.find((tx: Transaction) => {
        const txTime = parseInt(tx.timeStamp) * 1000;
        const tokenSymbol = tx.tokenSymbol?.toUpperCase();
        const decimals = parseInt(tx.tokenDecimal || '6');
        const amount = parseFloat(tx.value) / Math.pow(10, decimals);
        
        return (
          tx.from.toLowerCase() === walletAddress.toLowerCase() &&
          tx.to.toLowerCase() === PAYMENT_CONFIG.PAYMENT_ADDRESS.toLowerCase() &&
          (tokenSymbol === 'USDC' || tokenSymbol === 'USDT') &&
          amount >= parseFloat(PAYMENT_CONFIG.REQUIRED_AMOUNT_USDC) &&
          txTime > oneDayAgo
        );
      });
      
      if (recentUsdcTx) {
        return { verified: true, transaction: recentUsdcTx };
      }
    }
    
    return { verified: false, error: 'No valid payment found in recent transactions' };
    
  } catch (error) {
    console.error('Payment verification error:', error);
    return { verified: false, error: 'Failed to verify payment' };
  }
}

// Generate QR code data for payment
export function generatePaymentQR(currency: 'ETH' | 'USDC'): string {
  const amount = currency === 'ETH' ? PAYMENT_CONFIG.REQUIRED_AMOUNT_ETH : PAYMENT_CONFIG.REQUIRED_AMOUNT_USDC;
  
  // Ethereum payment URI format
  return `ethereum:${PAYMENT_CONFIG.PAYMENT_ADDRESS}?value=${currency === 'ETH' ? ethers.parseEther(amount).toString() : ''}`;
}

// Validate Farcaster signature (simplified)
export function validateFarcasterAuth(signature: string, message: string, fid: number): boolean {
  // In a real implementation, you would validate the signature against Farcaster's auth system
  // For now, we'll return true if basic format is correct
  return signature.length > 0 && message.includes(fid.toString());
}