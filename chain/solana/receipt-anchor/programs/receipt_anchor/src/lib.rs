use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111"); // Replace with actual program ID after `anchor deploy`

#[program]
pub mod receipt_anchor {
    use super::*;

    pub fn anchor_receipt(
        ctx: Context<AnchorReceipt>,
        job_id: String,
        receipt_hash: String,
        provider_pubkey: Pubkey,
        completed_at: i64,
    ) -> Result<()> {
        require!(job_id.len() <= 64, ReceiptError::JobIdTooLong);
        require!(receipt_hash.len() <= 64, ReceiptError::ReceiptHashTooLong);

        let record = &mut ctx.accounts.receipt_record;
        record.job_id = job_id;
        record.provider_pubkey = provider_pubkey;
        record.receipt_hash = receipt_hash;
        record.completed_at = completed_at;
        record.anchor = ctx.accounts.payer.key();
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(job_id: String)]
pub struct AnchorReceipt<'info> {
    #[account(
        init,
        payer = payer,
        space = ReceiptRecord::SIZE,
        seeds = [b"receipt", job_id.as_bytes()],
        bump
    )]
    pub receipt_record: Account<'info, ReceiptRecord>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ReceiptRecord {
    /// Job ID (max 64 chars)
    pub job_id: String,
    /// Provider who executed the job
    pub provider_pubkey: Pubkey,
    /// SHA-256 hex hash of the receipt (max 64 chars)
    pub receipt_hash: String,
    /// Unix timestamp when the job completed
    pub completed_at: i64,
    /// Pubkey of who anchored this receipt on-chain
    pub anchor: Pubkey,
}

impl ReceiptRecord {
    // 8 (discriminator) + 4+64 (job_id String) + 32 (provider_pubkey) + 4+64 (receipt_hash String) + 8 (completed_at) + 32 (anchor)
    pub const SIZE: usize = 8 + (4 + 64) + 32 + (4 + 64) + 8 + 32;
}

#[error_code]
pub enum ReceiptError {
    #[msg("Job ID must be 64 characters or fewer")]
    JobIdTooLong,
    #[msg("Receipt hash must be 64 characters or fewer")]
    ReceiptHashTooLong,
}
