import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  Keypair,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  createApproveInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
} from '@solana/spl-token';

// USDC token mint address on Solana mainnet
export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

// Payment configuration - reads from environment variables
export const PAYMENT_CONFIG = {
  get totalAmount(): number {
    return parseFloat(process.env.NEXT_PUBLIC_ANALYSIS_PRICE_USDC || process.env.ANALYSIS_PRICE_USDC || '0.30');
  },
  wallet1Percentage: parseInt(process.env.PAYMENT_WALLET_1_PERCENTAGE || '50', 10),
  wallet2Percentage: parseInt(process.env.PAYMENT_WALLET_2_PERCENTAGE || '50', 10),
  referralCommissionPercentage: 10, // 10% commission for referrers
  defaultAllowance: 3.00, // Default allowance amount (legacy, not used)
};

// Get wallet addresses from environment
export function getPaymentWallets(): { wallet1: string; wallet2: string } {
  const wallet1 = process.env.NEXT_PUBLIC_PAYMENT_WALLET_1 || '';
  const wallet2 = process.env.NEXT_PUBLIC_PAYMENT_WALLET_2 || '';

  if (!wallet1 || !wallet2) {
    throw new Error('Payment wallet addresses not configured');
  }

  return { wallet1, wallet2 };
}

// Get the delegate authority public key (server-side wallet that can spend on user's behalf)
export function getDelegateAuthority(): PublicKey {
  const delegateKey = process.env.NEXT_PUBLIC_DELEGATE_AUTHORITY;
  if (!delegateKey) {
    throw new Error('Delegate authority not configured');
  }
  return new PublicKey(delegateKey);
}

// Calculate split amounts (USDC has 6 decimals)
export function calculateSplitAmounts(): { amount1: number; amount2: number; total: number } {
  const totalInSmallestUnit = Math.round(PAYMENT_CONFIG.totalAmount * 1_000_000); // Convert to 6 decimals

  const amount1 = Math.floor(totalInSmallestUnit * (PAYMENT_CONFIG.wallet1Percentage / 100));
  const amount2 = totalInSmallestUnit - amount1; // Remaining goes to wallet2 to avoid rounding issues

  return { amount1, amount2, total: totalInSmallestUnit };
}

// Calculate split amounts with referral commission
export function calculateSplitAmountsWithReferral(): {
  referralCommission: number;
  amount1: number;
  amount2: number;
  total: number;
} {
  const totalInSmallestUnit = Math.round(PAYMENT_CONFIG.totalAmount * 1_000_000); // Convert to 6 decimals

  // Calculate referral commission (10% of total)
  const referralCommission = Math.floor(totalInSmallestUnit * (PAYMENT_CONFIG.referralCommissionPercentage / 100));

  // Remaining amount after referral commission
  const remainingAmount = totalInSmallestUnit - referralCommission;

  // Split remaining between wallet1 and wallet2
  const amount1 = Math.floor(remainingAmount * (PAYMENT_CONFIG.wallet1Percentage / 100));
  const amount2 = remainingAmount - amount1; // Remaining goes to wallet2 to avoid rounding issues

  return { referralCommission, amount1, amount2, total: totalInSmallestUnit };
}

// Check current allowance for the delegate authority
export async function checkAllowance(
  connection: Connection,
  ownerPublicKey: PublicKey
): Promise<number> {
  try {
    const delegateAuthority = getDelegateAuthority();
    const ownerTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      ownerPublicKey
    );

    const accountInfo = await getAccount(connection, ownerTokenAccount);

    // Check if delegate matches and get delegated amount
    if (accountInfo.delegate && accountInfo.delegate.equals(delegateAuthority)) {
      // Convert from smallest unit to USDC (6 decimals)
      return Number(accountInfo.delegatedAmount) / 1_000_000;
    }

    return 0;
  } catch {
    return 0;
  }
}

// Create transaction to approve delegate authority to spend USDC
export async function createApproveAllowanceTransaction(
  connection: Connection,
  ownerPublicKey: PublicKey,
  amount: number = PAYMENT_CONFIG.defaultAllowance
): Promise<Transaction> {
  const delegateAuthority = getDelegateAuthority();

  const ownerTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    ownerPublicKey
  );

  // Check if owner has USDC token account
  const accountInfo = await connection.getAccountInfo(ownerTokenAccount);
  if (!accountInfo) {
    throw new Error('You need USDC in your wallet to approve allowance');
  }

  // Convert amount to smallest unit (6 decimals)
  const amountInSmallestUnit = Math.round(amount * 1_000_000);

  // Create approve instruction
  const approveInstruction = createApproveInstruction(
    ownerTokenAccount,
    delegateAuthority,
    ownerPublicKey,
    amountInSmallestUnit,
    [],
    TOKEN_PROGRAM_ID
  );

  const transaction = new Transaction();
  transaction.add(approveInstruction);

  // Get latest blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = ownerPublicKey;

  return transaction;
}

// Create split payment transaction for USDC (manual signing)
export async function createSplitPaymentTransaction(
  connection: Connection,
  payerPublicKey: PublicKey
): Promise<Transaction> {
  const { wallet1, wallet2 } = getPaymentWallets();
  const { amount1, amount2 } = calculateSplitAmounts();

  const wallet1PublicKey = new PublicKey(wallet1);
  const wallet2PublicKey = new PublicKey(wallet2);

  // Get associated token accounts
  const payerTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    payerPublicKey
  );

  const wallet1TokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    wallet1PublicKey
  );

  const wallet2TokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    wallet2PublicKey
  );

  // Check if payer has USDC token account
  const payerAccountInfo = await connection.getAccountInfo(payerTokenAccount);
  if (!payerAccountInfo) {
    throw new Error('You need USDC in your wallet to pay for analysis');
  }

  // Create instructions array
  const instructions: TransactionInstruction[] = [];

  // Check if wallet1 token account exists, if not create it
  const wallet1AccountInfo = await connection.getAccountInfo(wallet1TokenAccount);
  if (!wallet1AccountInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        payerPublicKey, // payer
        wallet1TokenAccount, // associatedToken
        wallet1PublicKey, // owner
        USDC_MINT, // mint
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Check if wallet2 token account exists, if not create it
  const wallet2AccountInfo = await connection.getAccountInfo(wallet2TokenAccount);
  if (!wallet2AccountInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        payerPublicKey, // payer
        wallet2TokenAccount, // associatedToken
        wallet2PublicKey, // owner
        USDC_MINT, // mint
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Transfer to wallet 1
  if (amount1 > 0) {
    instructions.push(
      createTransferInstruction(
        payerTokenAccount,
        wallet1TokenAccount,
        payerPublicKey,
        amount1,
        [],
        TOKEN_PROGRAM_ID
      )
    );
  }

  // Transfer to wallet 2
  if (amount2 > 0) {
    instructions.push(
      createTransferInstruction(
        payerTokenAccount,
        wallet2TokenAccount,
        payerPublicKey,
        amount2,
        [],
        TOKEN_PROGRAM_ID
      )
    );
  }

  // Create transaction
  const transaction = new Transaction();
  transaction.add(...instructions);

  // Get latest blockhash with finalized commitment for longer validity
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = payerPublicKey;

  return transaction;
}

// Create split payment transaction with referral commission
export async function createSplitPaymentTransactionWithReferral(
  connection: Connection,
  payerPublicKey: PublicKey,
  referrerWalletAddress: string
): Promise<Transaction> {
  const { wallet1, wallet2 } = getPaymentWallets();
  const { referralCommission, amount1, amount2 } = calculateSplitAmountsWithReferral();

  const wallet1PublicKey = new PublicKey(wallet1);
  const wallet2PublicKey = new PublicKey(wallet2);
  const referrerPublicKey = new PublicKey(referrerWalletAddress);

  // Get associated token accounts
  const payerTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    payerPublicKey
  );

  const wallet1TokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    wallet1PublicKey
  );

  const wallet2TokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    wallet2PublicKey
  );

  const referrerTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    referrerPublicKey
  );

  // Check if payer has USDC token account
  const payerAccountInfo = await connection.getAccountInfo(payerTokenAccount);
  if (!payerAccountInfo) {
    throw new Error('You need USDC in your wallet to pay for analysis');
  }

  // Create instructions array
  const instructions: TransactionInstruction[] = [];

  // Check if referrer token account exists, if not create it
  const referrerAccountInfo = await connection.getAccountInfo(referrerTokenAccount);
  if (!referrerAccountInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        payerPublicKey, // payer
        referrerTokenAccount, // associatedToken
        referrerPublicKey, // owner
        USDC_MINT, // mint
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Check if wallet1 token account exists, if not create it
  const wallet1AccountInfo = await connection.getAccountInfo(wallet1TokenAccount);
  if (!wallet1AccountInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        payerPublicKey,
        wallet1TokenAccount,
        wallet1PublicKey,
        USDC_MINT,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Check if wallet2 token account exists, if not create it
  const wallet2AccountInfo = await connection.getAccountInfo(wallet2TokenAccount);
  if (!wallet2AccountInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        payerPublicKey,
        wallet2TokenAccount,
        wallet2PublicKey,
        USDC_MINT,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Transfer referral commission to referrer
  if (referralCommission > 0) {
    instructions.push(
      createTransferInstruction(
        payerTokenAccount,
        referrerTokenAccount,
        payerPublicKey,
        referralCommission,
        [],
        TOKEN_PROGRAM_ID
      )
    );
  }

  // Transfer to wallet 1
  if (amount1 > 0) {
    instructions.push(
      createTransferInstruction(
        payerTokenAccount,
        wallet1TokenAccount,
        payerPublicKey,
        amount1,
        [],
        TOKEN_PROGRAM_ID
      )
    );
  }

  // Transfer to wallet 2
  if (amount2 > 0) {
    instructions.push(
      createTransferInstruction(
        payerTokenAccount,
        wallet2TokenAccount,
        payerPublicKey,
        amount2,
        [],
        TOKEN_PROGRAM_ID
      )
    );
  }

  // Create transaction
  const transaction = new Transaction();
  transaction.add(...instructions);

  // Get latest blockhash with finalized commitment for longer validity
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = payerPublicKey;

  return transaction;
}

// Server-side: Execute delegated transfer (used by API route)
export async function executeDelegatedTransfer(
  connection: Connection,
  ownerPublicKey: PublicKey,
  delegateKeypair: Keypair
): Promise<string> {
  const { wallet1, wallet2 } = getPaymentWallets();
  const { amount1, amount2 } = calculateSplitAmounts();

  const wallet1PublicKey = new PublicKey(wallet1);
  const wallet2PublicKey = new PublicKey(wallet2);

  // Get associated token accounts
  const ownerTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    ownerPublicKey
  );

  const wallet1TokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    wallet1PublicKey
  );

  const wallet2TokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    wallet2PublicKey
  );

  // Create instructions array
  const instructions: TransactionInstruction[] = [];

  // Check if wallet1 token account exists, if not create it (delegate pays)
  const wallet1AccountInfo = await connection.getAccountInfo(wallet1TokenAccount);
  if (!wallet1AccountInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        delegateKeypair.publicKey, // payer (delegate pays for ATA creation)
        wallet1TokenAccount,
        wallet1PublicKey,
        USDC_MINT,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Check if wallet2 token account exists, if not create it
  const wallet2AccountInfo = await connection.getAccountInfo(wallet2TokenAccount);
  if (!wallet2AccountInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        delegateKeypair.publicKey,
        wallet2TokenAccount,
        wallet2PublicKey,
        USDC_MINT,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Transfer to wallet 1 using delegate authority
  if (amount1 > 0) {
    instructions.push(
      createTransferInstruction(
        ownerTokenAccount,
        wallet1TokenAccount,
        delegateKeypair.publicKey, // delegate signs instead of owner
        amount1,
        [],
        TOKEN_PROGRAM_ID
      )
    );
  }

  // Transfer to wallet 2 using delegate authority
  if (amount2 > 0) {
    instructions.push(
      createTransferInstruction(
        ownerTokenAccount,
        wallet2TokenAccount,
        delegateKeypair.publicKey, // delegate signs instead of owner
        amount2,
        [],
        TOKEN_PROGRAM_ID
      )
    );
  }

  // Create and sign transaction
  const transaction = new Transaction();
  transaction.add(...instructions);

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = delegateKeypair.publicKey;

  // Sign with delegate keypair
  transaction.sign(delegateKeypair);

  // Send transaction
  const signature = await connection.sendRawTransaction(transaction.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
    maxRetries: 3,
  });

  // Wait for confirmation
  await connection.confirmTransaction(
    {
      signature,
      blockhash,
      lastValidBlockHeight,
    },
    'confirmed'
  );

  return signature;
}

// Set to track used transaction signatures (prevents replay attacks)
// In production, this should be stored in a database
const usedSignatures = new Set<string>();

// Verify a payment transaction with full validation
export async function verifyPaymentTransaction(
  connection: Connection,
  signature: string,
  expectedPayer?: string
): Promise<{ verified: boolean; error?: string }> {
  try {
    // Check for replay attack
    if (usedSignatures.has(signature)) {
      return { verified: false, error: 'Transaction signature already used' };
    }

    // Get transaction details
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return { verified: false, error: 'Transaction not found' };
    }

    if (tx.meta?.err) {
      return { verified: false, error: 'Transaction failed' };
    }

    // Verify transaction is recent (within 5 minutes)
    const currentTime = Math.floor(Date.now() / 1000);
    if (tx.blockTime && currentTime - tx.blockTime > 300) {
      return { verified: false, error: 'Transaction too old (must be within 5 minutes)' };
    }

    // Get expected payment wallets and amounts
    const { wallet1, wallet2 } = getPaymentWallets();
    const { total } = calculateSplitAmounts();
    const expectedTotal = total; // in smallest unit (6 decimals)

    // Verify token transfers using pre/post token balances
    const preBalances = tx.meta?.preTokenBalances || [];
    const postBalances = tx.meta?.postTokenBalances || [];

    // Find USDC transfers to our payment wallets
    let totalTransferred = 0;
    let foundWallet1Transfer = false;
    let foundWallet2Transfer = false;

    // Get wallet token accounts
    const wallet1TokenAccount = await getAssociatedTokenAddress(USDC_MINT, new PublicKey(wallet1));
    const wallet2TokenAccount = await getAssociatedTokenAddress(USDC_MINT, new PublicKey(wallet2));

    for (const postBalance of postBalances) {
      // Check if this is USDC (verify mint address)
      if (postBalance.mint !== USDC_MINT.toBase58()) {
        continue;
      }

      const preBalance = preBalances.find(
        (pre) => pre.accountIndex === postBalance.accountIndex
      );

      const preAmount = preBalance?.uiTokenAmount?.amount ? parseInt(preBalance.uiTokenAmount.amount) : 0;
      const postAmount = postBalance.uiTokenAmount?.amount ? parseInt(postBalance.uiTokenAmount.amount) : 0;
      const transferred = postAmount - preAmount;

      // Check if transfer was to one of our payment wallets
      const accountKeys = tx.transaction.message.getAccountKeys();
      const accountKey = accountKeys.get(postBalance.accountIndex);

      if (accountKey) {
        if (accountKey.equals(wallet1TokenAccount)) {
          foundWallet1Transfer = true;
          totalTransferred += transferred;
        } else if (accountKey.equals(wallet2TokenAccount)) {
          foundWallet2Transfer = true;
          totalTransferred += transferred;
        }
      }
    }

    // Verify at least one payment wallet received funds
    if (!foundWallet1Transfer && !foundWallet2Transfer) {
      return { verified: false, error: 'No payment to authorized wallets found' };
    }

    // Verify total amount (allow small rounding differences, within 1%)
    const minExpected = Math.floor(expectedTotal * 0.99);
    if (totalTransferred < minExpected) {
      return { verified: false, error: `Insufficient payment amount. Expected ${expectedTotal}, got ${totalTransferred}` };
    }

    // Mark signature as used to prevent replay
    usedSignatures.add(signature);

    // Clean up old signatures (keep last 10000)
    if (usedSignatures.size > 10000) {
      const toDelete = Array.from(usedSignatures).slice(0, 1000);
      toDelete.forEach(sig => usedSignatures.delete(sig));
    }

    return { verified: true };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

// Get USDC balance for a wallet
export async function getUSDCBalance(
  connection: Connection,
  walletPublicKey: PublicKey
): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      walletPublicKey
    );

    const accountInfo = await connection.getTokenAccountBalance(tokenAccount);
    return Number(accountInfo.value.uiAmount || 0);
  } catch {
    return 0;
  }
}
