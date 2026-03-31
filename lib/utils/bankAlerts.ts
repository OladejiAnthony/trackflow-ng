/**
 * Nigerian Bank SMS / Alert Parser
 * Parses common bank notification formats into structured transaction data.
 * Used when users grant notification access on mobile.
 */

export interface ParsedBankAlert {
  type:         "credit" | "debit";
  amount:       number;
  bank:         string;
  description:  string;
  date:         Date;
  balance?:     number;
  reference?:   string;
}

// ─── Amount helpers ────────────────────────────────────────────────────────────

function parseAmount(raw: string): number {
  return parseFloat(raw.replace(/[₦NGN,\s]/gi, "")) || 0;
}

function extractAmount(text: string, pattern: RegExp): number | null {
  const m = text.match(pattern);
  return m ? parseAmount(m[1]) : null;
}

function extractBalance(text: string): number | undefined {
  const patterns = [
    /[Bb]al(?:ance)?[:\s]+[₦N]?([\d,]+(?:\.\d{2})?)/,
    /[Aa]vail(?:able)?[:\s]+[₦N]?([\d,]+(?:\.\d{2})?)/,
    /[Aa]cct [Bb]al[:\s]+[₦N]?([\d,]+(?:\.\d{2})?)/,
    /Your balance is [₦N]?([\d,]+(?:\.\d{2})?)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseAmount(m[1]);
  }
  return undefined;
}

function extractReference(text: string): string | undefined {
  const patterns = [
    /[Rr]ef(?:erence)?[:\s#]+([A-Z0-9]+)/,
    /[Tt]rans(?:action)?\s*[Ii][Dd][:\s]+([A-Z0-9]+)/i,
    /[Tt]rn[:\s]+([A-Z0-9]+)/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return undefined;
}

// ─── Bank-specific parsers ─────────────────────────────────────────────────────

type BankParser = (sms: string) => ParsedBankAlert | null;

// GTBank: "Acct:XXXXXXXX1234 Cr:₦50,000.00 Desc:TRANSFER/FROM JOHN..."
const parseGTBank: BankParser = (sms) => {
  if (!/GTB|Guaranty|gtbank/i.test(sms) && !/Acct:[0-9*X]+\s+(Cr|Dr):/i.test(sms)) return null;

  const isCr = /\bCr:/i.test(sms);
  const isDr = /\bDr:/i.test(sms);
  if (!isCr && !isDr) return null;

  const amount = extractAmount(sms, /(?:Cr|Dr):[₦N]?([\d,]+(?:\.\d{2})?)/i);
  if (!amount) return null;

  const descMatch = sms.match(/Desc[:\s]+([^\n]+)/i);
  return {
    type:        isCr ? "credit" : "debit",
    amount,
    bank:        "GTBank",
    description: descMatch ? descMatch[1].trim() : sms.substring(0, 60),
    date:        new Date(),
    balance:     extractBalance(sms),
    reference:   extractReference(sms),
  };
};

// Access Bank: "Your Acct XXXX1234 has been credited/debited with N5,000.00"
const parseAccessBank: BankParser = (sms) => {
  if (!/Access/i.test(sms) && !/Your Acct .+ has been (credited|debited)/i.test(sms)) return null;

  const creditMatch = /has been credited with [₦N]?([\d,]+(?:\.\d{2})?)/i.exec(sms);
  const debitMatch  = /has been debited with [₦N]?([\d,]+(?:\.\d{2})?)/i.exec(sms);
  const match  = creditMatch || debitMatch;
  if (!match) return null;

  const amount = parseAmount(match[1]);
  const descMatch = sms.match(/(?:Narr|Desc|Ref)[:\s]+([^\n.]+)/i);

  return {
    type:        creditMatch ? "credit" : "debit",
    amount,
    bank:        "Access Bank",
    description: descMatch ? descMatch[1].trim() : sms.substring(0, 60),
    date:        new Date(),
    balance:     extractBalance(sms),
    reference:   extractReference(sms),
  };
};

// OPay: "You have received ₦5,000.00 from JOHN DOE. Your balance is ₦15,500.00."
//       "You sent ₦2,000.00 to JANE DOE..."
const parseOPay: BankParser = (sms) => {
  if (!/OPay|Opay/i.test(sms) &&
      !/You have received ₦/i.test(sms) &&
      !/You sent ₦/i.test(sms)) return null;

  const receivedMatch = /You have received [₦N]?([\d,]+(?:\.\d{2})?) from (.+?)(?:\.|Your balance)/i.exec(sms);
  const sentMatch     = /You sent [₦N]?([\d,]+(?:\.\d{2})?) to (.+?)(?:\.|Ref)/i.exec(sms);

  const match = receivedMatch || sentMatch;
  if (!match) return null;

  return {
    type:        receivedMatch ? "credit" : "debit",
    amount:      parseAmount(match[1]),
    bank:        "OPay",
    description: `${receivedMatch ? "From" : "To"}: ${match[2].trim()}`,
    date:        new Date(),
    balance:     extractBalance(sms),
    reference:   extractReference(sms),
  };
};

// Moniepoint: "Credit: ₦20,000.00 received from JANE DOE. Balance: ₦75,000.00. Ref: MP12345678"
//             "Debit: ₦5,000.00 sent to JOHN DOE..."
const parseMoniepoint: BankParser = (sms) => {
  if (!/Moniepoint|MoniePoint/i.test(sms) &&
      !/^(Credit|Debit): [₦N]/i.test(sms)) return null;

  const creditMatch = /^Credit: [₦N]?([\d,]+(?:\.\d{2})?) received from ([^\n.]+)/im.exec(sms);
  const debitMatch  = /^Debit: [₦N]?([\d,]+(?:\.\d{2})?) sent to ([^\n.]+)/im.exec(sms);

  const match = creditMatch || debitMatch;
  if (!match) return null;

  return {
    type:        creditMatch ? "credit" : "debit",
    amount:      parseAmount(match[1]),
    bank:        "Moniepoint",
    description: `${creditMatch ? "From" : "To"}: ${match[2].trim()}`,
    date:        new Date(),
    balance:     extractBalance(sms),
    reference:   extractReference(sms),
  };
};

// First Bank: "Debit Alert: Acct:1234567890 Amt:₦2,500.00 Desc:POS/PAYMENT..."
//             "Credit Alert: ..."
const parseFirstBank: BankParser = (sms) => {
  if (!/First Bank|FirstBank/i.test(sms) &&
      !/(Debit|Credit) Alert:/i.test(sms)) return null;

  const isCr = /Credit Alert/i.test(sms);
  const amount = extractAmount(sms, /Amt:[₦N]?([\d,]+(?:\.\d{2})?)/i) ||
                 extractAmount(sms, /Amount:[₦N]?([\d,]+(?:\.\d{2})?)/i);
  if (!amount) return null;

  const descMatch = sms.match(/Desc[:\s]+([^\n]+)/i);
  return {
    type:        isCr ? "credit" : "debit",
    amount,
    bank:        "First Bank",
    description: descMatch ? descMatch[1].trim() : sms.substring(0, 60),
    date:        new Date(),
    balance:     extractBalance(sms),
    reference:   extractReference(sms),
  };
};

// UBA: "UBA: Your acct XXXXXXXX1234 was credited with NGN10,000.00. Avail Bal: NGN25,000.00"
const parseUBA: BankParser = (sms) => {
  if (!/\bUBA\b/i.test(sms)) return null;

  const creditMatch = /credited with (?:NGN|[₦N])?([\d,]+(?:\.\d{2})?)/i.exec(sms);
  const debitMatch  = /debited with (?:NGN|[₦N])?([\d,]+(?:\.\d{2})?)/i.exec(sms);

  const match = creditMatch || debitMatch;
  if (!match) return null;

  return {
    type:        creditMatch ? "credit" : "debit",
    amount:      parseAmount(match[1]),
    bank:        "UBA",
    description: sms.substring(0, 80).replace(/UBA:\s*/i, "").trim(),
    date:        new Date(),
    balance:     extractBalance(sms),
    reference:   extractReference(sms),
  };
};

// Zenith Bank: "Zenith Bank Cr Alert: Acct:XXXXX1234, Amt=NGN50,000.00, Bal=NGN120,000.00, Desc=TRANSFER"
const parseZenith: BankParser = (sms) => {
  if (!/Zenith/i.test(sms)) return null;

  const isCr = /Cr Alert/i.test(sms);
  const amount = extractAmount(sms, /Amt=(?:NGN|[₦N])?([\d,]+(?:\.\d{2})?)/i);
  if (!amount) return null;

  const descMatch = sms.match(/Desc=([^\n,]+)/i);
  return {
    type:        isCr ? "credit" : "debit",
    amount,
    bank:        "Zenith Bank",
    description: descMatch ? descMatch[1].trim() : sms.substring(0, 60),
    date:        new Date(),
    balance:     extractBalance(sms),
    reference:   extractReference(sms),
  };
};

// Fidelity: "Fidelity Bank: CR ₦10,000.00 Acct Bal: ₦45,000.00 Desc: SALARY PAYMENT"
const parseFidelity: BankParser = (sms) => {
  if (!/Fidelity/i.test(sms)) return null;

  const crMatch = /\bCR\b[:\s]+[₦N]?([\d,]+(?:\.\d{2})?)/i.exec(sms);
  const drMatch = /\bDR\b[:\s]+[₦N]?([\d,]+(?:\.\d{2})?)/i.exec(sms);

  const match = crMatch || drMatch;
  if (!match) return null;

  const descMatch = sms.match(/Desc[:\s]+([^\n]+)/i);
  return {
    type:        crMatch ? "credit" : "debit",
    amount:      parseAmount(match[1]),
    bank:        "Fidelity Bank",
    description: descMatch ? descMatch[1].trim() : sms.substring(0, 60),
    date:        new Date(),
    balance:     extractBalance(sms),
    reference:   extractReference(sms),
  };
};

// Kuda Bank: "You received ₦5,000 from JOHN DOE. Balance: ₦20,000. Ref: KD123456"
//            "You spent ₦1,500 at POS TERMINAL. Balance: ₦18,500."
const parseKuda: BankParser = (sms) => {
  if (!/Kuda/i.test(sms) &&
      !/You received ₦/i.test(sms) &&
      !/You spent ₦/i.test(sms)) return null;

  const receivedMatch = /You received [₦N]?([\d,]+(?:\.\d{2})?) from (.+?)(?:\.|Balance)/i.exec(sms);
  const spentMatch    = /You spent [₦N]?([\d,]+(?:\.\d{2})?) (?:at|on|to) (.+?)(?:\.|Balance)/i.exec(sms);

  const match = receivedMatch || spentMatch;
  if (!match) return null;

  return {
    type:        receivedMatch ? "credit" : "debit",
    amount:      parseAmount(match[1]),
    bank:        "Kuda Bank",
    description: `${receivedMatch ? "From" : "At"}: ${match[2].trim()}`,
    date:        new Date(),
    balance:     extractBalance(sms),
    reference:   extractReference(sms),
  };
};

// ─── General fallback ─────────────────────────────────────────────────────────

const parseGeneral: BankParser = (sms) => {
  // Detect credit keywords
  const isCreditKeyword = /\b(credited|received|credit|CR\b|Cr\b)/i.test(sms);
  const isDebitKeyword  = /\b(debited|deducted|debit|DR\b|Dr\b|sent|spent|withdrew)/i.test(sms);

  if (!isCreditKeyword && !isDebitKeyword) return null;

  // Extract amount: ₦, N, NGN followed by digits
  const amountMatch = sms.match(/[₦]([0-9,]+(?:\.[0-9]{2})?)/) ||
                      sms.match(/(?:NGN|N)\s*([0-9,]+(?:\.[0-9]{2})?)/i);
  if (!amountMatch) return null;

  const amount = parseAmount(amountMatch[1]);
  if (!amount || amount <= 0) return null;

  const bankName =
    /Stanbic/i.test(sms)  ? "Stanbic IBTC" :
    /Sterling/i.test(sms) ? "Sterling Bank" :
    /Polaris/i.test(sms)  ? "Polaris Bank"  :
    /FCMB/i.test(sms)     ? "FCMB"          :
    /Wema/i.test(sms)     ? "Wema Bank"     :
    /Jaiz/i.test(sms)     ? "Jaiz Bank"     :
                            "Unknown Bank";

  return {
    type:        isCreditKeyword ? "credit" : "debit",
    amount,
    bank:        bankName,
    description: sms.replace(/\n/g, " ").substring(0, 100).trim(),
    date:        new Date(),
    balance:     extractBalance(sms),
    reference:   extractReference(sms),
  };
};

// ─── Main export ──────────────────────────────────────────────────────────────

const PARSERS: BankParser[] = [
  parseGTBank,
  parseAccessBank,
  parseOPay,
  parseMoniepoint,
  parseFirstBank,
  parseUBA,
  parseZenith,
  parseFidelity,
  parseKuda,
  parseGeneral,
];

/**
 * Parse a Nigerian bank SMS / push notification into a structured transaction.
 * Returns null if the message cannot be identified as a bank alert.
 *
 * @example
 * parseBankAlert("Credit: ₦20,000.00 received from JANE DOE. Balance: ₦75,000.00. Ref: MP12345678")
 * // => { type: "credit", amount: 20000, bank: "Moniepoint", ... }
 */
export function parseBankAlert(sms: string): ParsedBankAlert | null {
  if (!sms || sms.trim().length < 10) return null;

  for (const parser of PARSERS) {
    const result = parser(sms);
    if (result && result.amount > 0) return result;
  }

  return null;
}
