import { PublicKey, Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export async function reclaimTokenAccounts(owner: PublicKey, connection: Connection, tokenProgramId = TOKEN_PROGRAM_ID) {

    //get all token accounts owned by the owner to reclaim rent
    const accounts = await connection.getTokenAccountsByOwner(owner, { programId: tokenProgramId });
    const tokenAccounts = accounts.value;
    const ClaimableAccounts: PublicKey[] = [];
    
    tokenAccounts.forEach(accountInfo => {
        const balance = accountInfo.account.data.readBigInt64LE(64);
        if (!balance) {
            ClaimableAccounts.push(accountInfo.pubkey);
        }
    });

    console.log("can claim Rent for" + ClaimableAccounts.length + " inactive token accounts");
    return reclaimTokenAccounts;
}
