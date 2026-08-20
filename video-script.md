# Video script (Task 4 — max 3 minutes)

Speak naturally, from the slide deck. Rough timing in brackets.

---

[0:00] Hi, this is my submission for the Turbin3 prerequisite. I'll walk through the
Anchor Vault program and the change I made for Task 2.

[0:20] First, the basics. On Solana, programs are stateless — they hold no data. All
state lives in accounts. Our vault uses two PDAs: `vault_state`, which just stores the
bumps, and `vault`, which actually holds the SOL. A PDA has no private key, so only our
program can sign for it using signer seeds. That's what makes the vault secure.

[0:50] There are four instructions. `initialize` creates both PDAs. `deposit` moves SOL
from the user into the vault, through a CPI to the System Program. `withdraw` moves SOL
back out — and because SOL is leaving an account the vault owns, the vault PDA has to
sign. `close` drains the vault and deletes the state, returning the rent.

[1:20] Task 2 is the part I extended. `withdraw` already declared two accounts it wasn't
using: `application_account`, a PDA under the registration program at seeds
`prereqs` plus user, and `application_program`. After returning the SOL, `withdraw` now
calls the registration program's `initialize` instruction and passes the user's GitHub
username.

[1:50] Why this works: the user signed the transaction, and signer status carries through
a CPI — so the registration program accepts the user as the signer and creates the
account. I deployed my own copy of the vault program to devnet, not the one provided, and
verified on-chain that after a withdrawal the account records my GitHub username.

[2:20] That's the whole design: programs are functions, accounts are the arguments, PDAs
are addresses only the program can authorize, and a CPI is one program calling another in
the same transaction. Thanks.

---

Tips: don't read the code line by line — talk about the design. Keep it conversational.
Add auto-captions on YouTube and review them.
