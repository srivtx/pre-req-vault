# pre-req-vault (Turbin3 prerequisite challenge)

An Anchor vault program extended to call a separate registration program via CPI
during withdrawal. This repo is the deliverable for the Turbin3 prerequisite
challenge (Task 2), plus supporting material that explains how it works.

## What the program does

Four instructions, all under the `pre_req_vault` program:

| Instruction     | What it does                                                        |
| --------------- | ------------------------------------------------------------------- |
| `initialize`    | Creates the `vault_state` PDA (stores bumps) and the `vault` PDA.   |
| `deposit`       | CPI to System Program: moves SOL from the user into the `vault`.    |
| `withdraw`      | `vault` PDA signs and moves SOL back to the user — **and calls the registration program (Task 2)**. |
| `close`         | Drains the `vault` and deletes `vault_state` (rent returned).       |

Accounts:

- `vault_state` — PDA at seeds `["state", user]`; stores `vault_bump` / `state_bump`.
- `vault` — PDA at seeds `["vault", vault_state]`; holds the deposited SOL. It has no
  private key, so only the program can move SOL out of it (via signer seeds).
- `application_account` — PDA at seeds `["prereqs", user]` under the **registration**
  program; records the wallet's GitHub username.

## Task 2 — the CPI

`withdraw` now performs a Cross-Program Invocation into the registration program's
`initialize` instruction, passing the user's GitHub username. Because the user signed
the outer transaction, signer status propagates through the CPI, so the registration
program accepts the user as the signer that creates `application_account`.

The change is isolated to `programs/pre-req-vault/src/instructions/withdraw.rs`
(a `github: String` argument was also added to the instruction). The registration
program itself (`TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM`) is provided by the
challenge and was not modified or deployed.

## Deployment

The program is deployed to devnet at its own address (not the original placeholder):

```
2RFyzJKvv16zuzPbE9KuNv8GZBXtVEDAMtCdR54H7L9n
```

Verification: after a withdrawal, the `application_account` PDA under the registration
program contains `github = "srivtx"` for this wallet. Run `tests/verify_registration.ts`
(or `anchor test`) to check.

## Build, deploy, test

Requires Rust, Solana CLI, and Anchor (`avm use 1.1.2` — the program uses `anchor-lang = "1.1.2"`).

```bash
anchor build
anchor keys sync          # point declare_id! at a fresh keypair
anchor build               # rebuild with the new id
solana program deploy target/deploy/pre_req_vault.so \
  --program-id target/deploy/pre_req_vault-keypair.json -u devnet
```

```bash
export ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
export ANCHOR_WALLET="$HOME/.config/solana/id.json"
pnpm install
pnpm exec ts-mocha -p ./tsconfig.json -t 1000000 "tests/**/*.ts"
```

Note: one registration is allowed per wallet, so the full flow runs once per fresh wallet.

## Repo layout

```
programs/pre-req-vault/src/instructions/   # initialize, deposit, withdraw, close
idls/registration.json                      # interface of the registration program (given)
tests/pre-req-vault.ts                      # initialize -> deposit -> withdraw -> close
tests/verify_registration.ts               # fetches + decodes the on-chain record
explainer/                                  # long-form write-up + slide deck (source for the site)
architecture-diagram.svg                    # structure diagram
sequence-diagram.svg                        # withdraw + CPI sequence
```

## Site

A written explanation and a navigable slide deck are published via GitHub Pages:

- https://srivtx.github.io/pre-req-vault/  (write-up)
- https://srivtx.github.io/pre-req-vault/deck.html  (slides)
