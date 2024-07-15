import {ActionGetResponse, ActionPostRequest,MEMO_PROGRAM_ID, ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse} from "@solana/actions"
import { ComputeBudgetProgram,PublicKey,Transaction,TransactionInstruction,Connection, clusterApiUrl} from "@solana/web3.js";

export const GET = (req:Request) => {
    const payload:ActionGetResponse  = {
        icon: new URL("/next.svg", new URL(req.url).origin).toString(),
        title: "memo blink",
        description: "did you know that memo is a memo",
        label: "send memo"
    } 

    return Response.json(payload,{headers:ACTIONS_CORS_HEADERS});
};

export const OPTIONS = GET;


export const POST = async (req:Request) => {
    try {
        const body:ActionPostRequest = await req.json();

        let account:PublicKey;
        try {
            account = new PublicKey(body.account);
        } catch (err) {
            return new Response("Invalid account", {status:400,headers: ACTIONS_CORS_HEADERS});
        }

        const connection = new Connection(clusterApiUrl("devnet"));

        const transaction = new Transaction()
        .add(
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: 1000,
            }),
            new TransactionInstruction({
                programId: new PublicKey(MEMO_PROGRAM_ID),
                data: Buffer.from("hello world","utf-8"),
                keys: [],  
            }),
        );

        transaction.feePayer = account;

        
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const payload:ActionPostResponse = await createPostResponse({
            fields: {
                transaction
            },
            // signers: [],
        })
        return Response.json(payload, {headers:ACTIONS_CORS_HEADERS});
    } catch (error) {
        return Response.json("An Unknown error occured", {status:400});
    }
};