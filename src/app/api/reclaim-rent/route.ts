import {ActionGetResponse,ActionPostRequest,ActionPostResponse,ACTIONS_CORS_HEADERS} from "@solana/actions";
import {reclaimTokenAccounts} from "./reclaimTokenAccounts";
import {PublicKey, Connection,clusterApiUrl,Transaction, ComputeBudgetProgram} from "@solana/web3.js";
import { createCloseAccountInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const GET = (req:Request) => {

    const payload:ActionGetResponse = {
        icon: new URL("/reclaim-rent.png", new URL(req.url).origin).toString(),
        title: "Reclaim Rent for SOL",
        description: "Reclaim rent for token accounts with no balances",
        label: "Reclaim Rent",
        links: {
            actions: [
                {
                    href: req.url + "?pg=reclaim",
                    label: "Reclaim Rent"
                },
            ]
    }
    }
    return Response.json(payload,{headers:ACTIONS_CORS_HEADERS});
}

export const OPTIONS = GET;


export const POST = async(req:Request) => {
    try {
        const body:ActionPostRequest = await req.json();
        let account:PublicKey;
        try {
            account = new PublicKey(body.account);
        } catch (err) {
            return new Response("Invalid account", {status:400,headers: ACTIONS_CORS_HEADERS});
        }

        const url = new URL(req.url);
        const programString = url.searchParams.get("pg");
        if (programString !== "reclaim") {
            return new Response("Invalid program", {status:400,headers: ACTIONS_CORS_HEADERS});
        }

        const connection = new Connection(clusterApiUrl("devnet"));
        const transaction = new Transaction();
        transaction.add(ComputeBudgetProgram.setComputeUnitPrice({microLamports: 1000}));

        let closeAccounts = await reclaimTokenAccounts(account, connection, TOKEN_PROGRAM_ID) as unknown as PublicKey[];

        const instruction = closeAccounts.map(key => createCloseAccountInstruction(key, account, account));
        if (instruction.length > 0) {
            transaction.add(...instruction);
        }

        transaction.feePayer = account;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        const serializedTransaction = transaction.serialize({requireAllSignatures: false, verifySignatures: false}).toString("base64");

        const payload:ActionPostResponse = ({
                transaction:serializedTransaction,
                message: "Reclaiming Rent for token accounts with no balances" 
        });

        return Response.json(payload, {headers:ACTIONS_CORS_HEADERS});
    } catch (error) {
        console.error(error);
        return new Response("An Unknown error occurred", { status: 400, headers: ACTIONS_CORS_HEADERS });
    }
}