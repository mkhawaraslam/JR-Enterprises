export const PDF_ITEM_FONT = {
  size: 11,
  lineHeight: 1.2,
  paddingTop: 3,
  paddingX: 4,
} as const;

/** Helvetica-Bold AFM widths in 1/1000 em. */
const CHAR_WIDTH: Record<string, number> = {
  " ": 278,
  "!": 333,
  '"': 474,
  "#": 556,
  $: 556,
  "%": 889,
  "&": 722,
  "'": 238,
  "(": 333,
  ")": 333,
  "*": 389,
  "+": 584,
  ",": 278,
  "-": 333,
  ".": 278,
  "/": 278,
  "0": 556,
  "1": 556,
  "2": 556,
  "3": 556,
  "4": 556,
  "5": 556,
  "6": 556,
  "7": 556,
  "8": 556,
  "9": 556,
  ":": 333,
  ";": 333,
  "<": 584,
  "=": 584,
  ">": 584,
  "?": 611,
  "@": 975,
  A: 722,
  B: 722,
  C: 722,
  D: 722,
  E: 667,
  F: 611,
  G: 778,
  H: 722,
  I: 278,
  J: 556,
  K: 722,
  L: 611,
  M: 833,
  N: 722,
  O: 778,
  P: 667,
  Q: 778,
  R: 722,
  S: 667,
  T: 611,
  U: 722,
  V: 667,
  W: 944,
  X: 667,
  Y: 667,
  Z: 611,
  "[": 333,
  "\\": 278,
  "]": 333,
  "^": 584,
  _: 556,
  "`": 333,
  a: 556,
  b: 611,
  c: 556,
  d: 611,
  e: 556,
  f: 333,
  g: 611,
  h: 611,
  i: 278,
  j: 278,
  k: 556,
  l: 278,
  m: 889,
  n: 611,
  o: 611,
  p: 611,
  q: 611,
  r: 389,
  s: 556,
  t: 333,
  u: 611,
  v: 556,
  w: 778,
  x: 556,
  y: 556,
  z: 500,
  "{": 389,
  "|": 280,
  "}": 389,
  "~": 584,
};

function charWidth(char: string, fontSize: number) {
  const unit = CHAR_WIDTH[char] ?? 610;
  return (unit / 1000) * fontSize;
}

function textWidth(text: string, fontSize: number) {
  let width = 0;
  for (const char of text) {
    width += charWidth(char, fontSize);
  }
  return width;
}

function breakLongWord(word: string, maxWidth: number, fontSize: number) {
  const parts: string[] = [];
  let current = "";
  for (const char of word) {
    const next = current + char;
    if (current && textWidth(next, fontSize) > maxWidth) {
      parts.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  if (current) parts.push(current);
  return parts;
}

export function wrapPdfText(text: string, maxWidth: number, fontSize = PDF_ITEM_FONT.size) {
  const normalized = text.replace(/\r\n/g, "\n").trim() || " ";
  const lines: string[] = [];

  for (const paragraph of normalized.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let current = "";
    for (const word of words) {
      const chunks =
        textWidth(word, fontSize) > maxWidth ? breakLongWord(word, maxWidth, fontSize) : [word];
      for (const chunk of chunks) {
        const next = current ? `${current} ${chunk}` : chunk;
        if (current && textWidth(next, fontSize) > maxWidth) {
          lines.push(current);
          current = chunk;
        } else {
          current = next;
        }
      }
    }
    if (current) lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}

export function measureItemRowHeight(description: string, columnWidth: number) {
  const textWidthAvailable = Math.max(12, columnWidth - PDF_ITEM_FONT.paddingX * 2);
  const lines = wrapPdfText(description, textWidthAvailable);
  const textHeight = lines.length * PDF_ITEM_FONT.size * PDF_ITEM_FONT.lineHeight;
  return PDF_ITEM_FONT.paddingTop + textHeight + 2;
}
