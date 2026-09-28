/* ============================================================
   THE ONLY CONCLUSION — site settings.  EDIT THIS FILE ONLY.
   Everything the site needs from you lives here. See SETUP.md.
   ============================================================ */
window.TOC_CONFIG = {

  /* Where the BUY buttons go.
     Use Amazon Associates links (tag=buyonemedia-20) so sales earn a commission.
     Never put these tagged links in emails or printed books; Amazon doesn't allow that. */
  amazon: {
    allHands: "https://www.amazon.com/dp/B0HL783M57?spcref=PRINT_LISTING&linkCode=ll2&tag=buyonemedia-20&linkId=a9001ac5b73049665e1be4efd5e31b84&language=en_US&gaOptInStatus=true&ref_=as_li_ss_tl",   // Amazon Associates link (tag buyonemedia-20)
    musicVault: "",         // leave empty until THE MUSIC VAULT is live; the page shows "Coming soon"

    /* Where theonlyconclusion.com/review sends people (the QR review cards in the tester packet).
       Once ALL HANDS has its ASIN, use: "https://www.amazon.com/review/create-review?asin=B0XXXXXXXX" */
    review: "https://www.amazon.com/review/create-review?asin=B0HL783M57"
  },

  /* Your email service.
     provider: "mailerlite" or "kit" (ConvertKit). It only sets the field names below.
     For each list, paste the form's POST address from the email service
     (MailerLite: Forms > Embedded form > HTML code, the <form action="..."> address;
      Kit: Forms > Embed > HTML, the <form action="..."> address).
     Leave an address empty and that form still works on the page,
     but nobody is added to a list (the page says so, quietly). */
  email: {
    provider: "mailerlite",
    lists: {
      // Home page + book pages: "tell me when the next case opens"
      news:                 { action: "" },
      // /musicvault-casezero (printed in ALL HANDS) — sends the Cleveland letter of reference
      "musicvault-casezero":{ action: "" },
      // /sugarcamp-casezero (printed in THE MUSIC VAULT) — sends Carl's reply; pre-order list for THE SUGAR CAMP
      "sugarcamp-casezero": { action: "" }
    }
  }
};
