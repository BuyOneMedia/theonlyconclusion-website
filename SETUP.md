# theonlyconclusion.com — how to put it live

Folder: `The Only Conclusion\WEBSITE\`

- `site\` — **the website.** This whole folder is what you upload. Nothing else.
- `src\` — the words. `src\pages\*.html` is one file per page; `src\partials\` is the shared header, footer and page head.
- `build.py` — turns `src\` into `site\`. Run `python build.py` after you change any words in `src\`.
- `site\assets\js\config.js` — **the only file with settings**: Amazon links and the email service. Edit it directly (no build needed).

## Pages

| Address | What it is | Printed where |
|---|---|---|
| `/` | Home: practice sheet you can play, how it works, the cases, Case Zero, free master sheet, FAQ, mailing list | QR / ONLINE page in both books |
| `/books/all-hands/` | ALL HANDS page with buy button | |
| `/books/the-music-vault/` | THE MUSIC VAULT page, "coming soon" + sign-up | |
| `/musicvault-casezero/` | Case Zero answer + Cleveland letter of reference with the reader's name | back of ALL HANDS |
| `/sugarcamp-casezero/` | Case Zero answer + Carl's reply with the reader's name | back of THE MUSIC VAULT |
| `/review/` | Sends people to the Amazon review page | tester packet QR cards |
| `/privacy/` | Privacy page (needed for email sign-ups) | |
| `/assets/downloads/all-hands-master-sheet.pdf` | Free master sheet, no email | ALL HANDS ONLINE page |

The Case Zero answers are hidden in the page code (encoded) and only appear after the reader fills in the form. The reader's name is typed into the letter on screen, and there's a Print button.

Short links that also work (in `site\_redirects`): `/allhands`, `/musicvault`, `/casezero`, `/sheets`, and capitalised or hyphenated versions of the Case Zero addresses, so a reader who types it slightly wrong still lands.

## Step 1 — Before launch: the settings (config.js)

1. **ALL HANDS buy link. DONE (27 Sep).** Every buy button uses the Amazon Associates link (ASIN B0HL783M57, tag `buyonemedia-20`), so sales earn a commission. The footer carries the required line "As an Amazon Associate we earn from qualifying purchases."
   Amazon rules: use tagged links only on the website and social posts. Never in emails (including the Case Zero emails), printed books or PDFs, and never to buy your own copies.
2. **Review link. DONE.** `/review` forwards to https://www.amazon.com/review/create-review?asin=B0HL783M57
3. **THE MUSIC VAULT.** Leave `musicVault: ""` until it's live. The buy button stays hidden and the page says "Coming soon".

## Step 2 — The email service

Recommended: **MailerLite** (it has a free plan, forms, groups and automations; check their current limits). Kit (ConvertKit) works too: set `provider: "kit"` in config.js.

Make **three groups**, one per list:

| Group | Filled by | Its welcome email sends |
|---|---|---|
| `TOC news` | home + book page sign-ups | a one-line thank-you (optional) |
| `Case Zero – Music Vault` | `/musicvault-casezero` | the Cleveland letter of reference, with the reader's name |
| `Case Zero – Sugar Camp` | `/sugarcamp-casezero` | Carl's reply, with the reader's name |

For each group:
1. Forms → Embedded form → attach it to that group. Fields: Email, and Name (for the two Case Zero groups).
2. Open the form's HTML code and copy the address in `<form action="...">`.
3. Paste it into config.js under the matching list (`news`, `musicvault-casezero`, `sugarcamp-casezero`).
4. Automations → "When subscriber joins group" → send the email below. In MailerLite the name goes in as `{$name}`; in Kit as `{{ subscriber.first_name }}`.
5. Test it: fill in the form on the live site with your own address and check the email arrives.

If a list address is left empty, that form still works on the page (the reader still sees the answer and the letter), but nobody is added to the list, and the page says so in small print.

### Email: Case Zero – Music Vault
**Subject:** Your letter of reference

> {$name},
>
> Here's the answer to Case Zero, and the letter the man in Cleveland wrote for you. It's how the next client found you.
>
> [paste the letter from `00 SERIES\WEBSITE - launch copy.md`, replacing {NAME} with {$name}]
>
> THE MUSIC VAULT opens in the same vault, five years later. We'll write once when it's ready.
>
> — The Only Conclusion

### Email: Case Zero – Sugar Camp
**Subject:** Carl wrote back

> {$name},
>
> Carl Lindqvist's reply came after the Navy's visit. Here it is.
>
> [paste Carl's reply from `00 SERIES\WEBSITE - launch copy.md`, replacing {NAME} with {$name}]
>
> THE SUGAR CAMP opens in the same shop, two years later. We'll write once when it's ready.
>
> — The Only Conclusion

## Step 3 — Server Deployment (Hetzner)

The site is deployed on the Hetzner server (`5.78.107.55`) in `/var/www/theonlyconclusion.com`.

- **Web Server:** Nginx (`nginx:alpine`) running via Docker Compose (`theonlyconclusion-web`), routed through Traefik (`coolify-proxy`) on the `coolify` Docker network.
- **DNS / SSL:** Cloudflare proxies `theonlyconclusion.com` and `www.theonlyconclusion.com` to Hetzner (`5.78.107.55`). Traefik terminates SSL and handles HTTPS redirection.
- **Redirects:** All short links (`/allhands`, `/musicvault`, `/casezero`, `/sheets`, etc.) and canonical www-to-apex redirection are defined in [nginx.conf](file:///d:/Documents/Business/Books/Brain%20Focus/The%20Only%20Conclusion/WEBSITE/nginx.conf).
- **Updating the live site:**
  1. Edit words in `src/` or settings in `site/assets/js/config.js`.
  2. Run `python build.py`.
  3. Upload the changes or run `./deploy.sh` on the server.


## Step 4 — Launch checks

- [x] ALL HANDS is Live; Associates link and review link in config.js.
- [ ] All three email forms connected and tested with your own address.
- [ ] Scan the QR code from a **printed** proof, not the screen.
- [ ] Type the two Case Zero addresses exactly as printed in the books and check they open.
- [ ] Download the master sheet from your phone.

## Later

- **When THE MUSIC VAULT is live:** set `musicVault` in config.js, change its status from COMING SOON to OUT NOW in `src\pages\index.html` and `book-music-vault.html`, and add its master sheet next to ALL HANDS's (Free sheets section).
- **When THE SUGAR CAMP prints:** build `/nitrateroom-casezero` by copying `src\pages\cz-sugarcamp.html` (the walkthrough is in the launch copy; Mrs. Garrity's note still needs writing).
- **Hints by email:** the site doesn't offer it. THE MUSIC VAULT's last page now says "Print a fresh master sheet" instead, so the book doesn't promise it.
