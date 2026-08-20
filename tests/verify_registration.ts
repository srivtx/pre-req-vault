import * as anchor from "@anchor-lang/core";
import { PublicKey } from "@solana/web3.js";
import { readFileSync } from "fs";
import { expect } from "chai";

describe("verify registration record", () => {
  it("fetches + decodes the ApplicationAccount for this wallet", async () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const regProgram = new PublicKey(
      "TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM",
    );
    const user = provider.wallet.publicKey;
    const [appPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("prereqs"), user.toBuffer()],
      regProgram,
    );

    const info = await provider.connection.getAccountInfo(appPda);
    expect(info, "ApplicationAccount should exist").to.not.be.null;
    expect(info!.owner.toBase58()).to.equal(regProgram.toBase58());

    const data = info!.data;
    // layout: 8-byte discriminator | user(Pubkey) | bump(u8) | pre_req_ts(bool) | pre_req_rs(bool) | github(string: u32 len + bytes)
    const recUser = new PublicKey(data.subarray(8, 40));
    const bump = data[40];
    const preReqTs = data[41] === 1;
    const preReqRs = data[42] === 1;
    const ghLen = data.readUInt32LE(43);
    const github = data.subarray(47, 47 + ghLen).toString("utf8");

    console.log("wallet:       ", user.toBase58());
    console.log("applicationPda:", appPda.toBase58());
    console.log("---- registration record ----");
    console.log("user:     ", recUser.toBase58());
    console.log("bump:     ", bump);
    console.log("preReqTs: ", preReqTs);
    console.log("preReqRs: ", preReqRs);
    console.log("github:   ", github);

    expect(recUser.toBase58()).to.equal(user.toBase58());
    expect(github).to.equal("srivtx");
    // note: pre_req_rs / pre_req_ts are set later by submit_rs / submit_ts.
    // `initialize` (the CPI our withdraw calls) records the GitHub username.
  });
});
