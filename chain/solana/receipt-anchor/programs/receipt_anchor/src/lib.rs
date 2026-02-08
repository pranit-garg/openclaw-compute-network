// STUB — TODO: Full Anchor program for receipt anchoring on Solana — See BACKLOG.md#receipt-anchoring
//
// This is a skeleton Solana program using the Anchor framework.
// Single instruction: anchor_receipt stores a receipt hash in a PDA.

use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111"); // STUB — replace with actual program ID after deploy

#[program]
pub mod receipt_anchor {
    use super::*;

    pub fn anchor_receipt(ctx: Context<AnchorReceipt>, receipt_hash: [u8; 32]) -> Result<()> {
        let receipt = &mut ctx.accounts.receipt;
        receipt.hash = receipt_hash;
        receipt.submitter = ctx.accounts.submitter.key();
        receipt.timestamp = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(receipt_hash: [u8; 32])]
pub struct AnchorReceipt<'info> {
    #[account(
        init,
        payer = submitter,
        space = 8 + 32 + 32 + 8,
        seeds = [b"receipt", &receipt_hash],
        bump
    )]
    pub receipt: Account<'info, ReceiptAccount>,
    #[account(mut)]
    pub submitter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ReceiptAccount {
    pub hash: [u8; 32],
    pub submitter: Pubkey,
    pub timestamp: i64,
}
