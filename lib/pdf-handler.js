/**
 * Dynamic loader and handler for client-side PDF.js extraction
 */

/**
 * Loads PDF.js client-side dynamically and configures the worker
 * @returns {Promise<Object>} The pdfjsLib instance
 */
async function loadPdfJS() {
  if (typeof window === "undefined") {
    throw new Error("PDF parsing can only run in the browser");
  }

  if (window.pdfjsLib) {
    return window.pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    let script = document.getElementById("pdfjs-cdn-script");
    if (script) {
      const checkInterval = setInterval(() => {
        if (window.pdfjsLib) {
          clearInterval(checkInterval);
          resolve(window.pdfjsLib);
        }
      }, 100);
      return;
    }

    script = document.createElement("script");
    script.id = "pdfjs-cdn-script";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    script.onerror = (err) => {
      reject(new Error("Failed to load PDF.js from CDN: " + err.message));
    };
    document.head.appendChild(script);
  });
}

/**
 * Detects the paper title from first-page font-size data.
 * Picks text rendered at the largest font size in the top portion of the page,
 * which is where titles appear in MDPI, IEEE, Google Scholar, ResearchGate, arXiv, etc.
 *
 * @param {Array<{str: string, height: number, y: number}>} fontItems - Items from first page with height
 * @param {string} filenameTitle - Fallback title from filename (stripped extension)
 * @returns {string} Detected title
 */
export function detectTitleFromFontData(fontItems, filenameTitle = "") {
  if (!fontItems || fontItems.length === 0) return filenameTitle;

  // Filter out empty strings and very short fragments
  const valid = fontItems.filter(
    (item) => item.str && item.str.trim().length > 1
  );
  if (valid.length === 0) return filenameTitle;

  // Find the maximum Y position (top of page in PDF coords is highest Y)
  const maxY = Math.max(...valid.map((i) => i.y));
  const minY = Math.min(...valid.map((i) => i.y));
  const pageHeight = maxY - minY;

  // Only consider items in the top 55% of the page — titles are never at bottom
  const topItems = valid.filter((i) => i.y >= minY + pageHeight * 0.45);

  // Skip patterns: affiliations, emails, journal names, page numbers, DOIs, copyright
  const skipPatterns = [
    /^\d+$/, // lone numbers (page numbers)
    /doi:/i,
    /https?:\/\//i,
    /@/,
    /©|copyright/i,
    /received:/i,
    /accepted:/i,
    /published:/i,
    /correspondence:/i,
    /^abstract$/i,
    /^keywords?:/i,
    /^introduction$/i,
    /university|institute|department|school|college|laboratory/i,
    /journal of|proceedings of|conference on|transactions on|letters on/i,
    /vol\.|issue|pp\.|issn|isbn/i,
    /mdpi|elsevier|springer|wiley|ieee|acm|nature|science/i,
  ];

  const filteredTop = topItems.filter(
    (i) => !skipPatterns.some((p) => p.test(i.str.trim()))
  );

  if (filteredTop.length === 0) return filenameTitle;

  // Find the maximum font height among candidates
  const maxHeight = Math.max(...filteredTop.map((i) => i.height));

  if (maxHeight < 6) return filenameTitle; // too small to be a title

  // Collect all items rendered at or near the max font size (within 2pt)
  const titleItems = filteredTop
    .filter((i) => i.height >= maxHeight - 2)
    .sort((a, b) => b.y - a.y || a.x - b.x); // top-to-bottom, left-to-right

  // Group into lines by Y proximity (within 4 units = same line)
  const lines = [];
  for (const item of titleItems) {
    const existingLine = lines.find((l) => Math.abs(l.y - item.y) < 4);
    if (existingLine) {
      existingLine.parts.push(item);
    } else {
      lines.push({ y: item.y, parts: [item] });
    }
  }

  // Sort lines top-to-bottom (descending Y in PDF coords)
  lines.sort((a, b) => b.y - a.y);

  // Build title from first 1-3 lines of large text (multi-line titles are common)
  const titleLines = lines.slice(0, 3).map((line) =>
    line.parts
      .sort((a, b) => a.x - b.x)
      .map((p) => p.str.trim())
      .filter(Boolean)
      .join(" ")
  );

  const title = titleLines.join(" ").replace(/\s+/g, " ").trim();

  // Sanity checks: must be between 10 and 200 chars
  if (title.length < 10 || title.length > 200) return filenameTitle;

  return title;
}

/**
 * Detects author names from first-page font data.
 * 
 * Strategy: Authors appear BELOW the title and ABOVE the abstract/body text.
 * We identify the title region (largest font), then look at the zone between
 * the title bottom and the abstract/introduction header for author-like text.
 *
 * @param {Array<{str: string, height: number, y: number, x: number}>} fontItems
 * @param {string} detectedTitle - Already-detected title (used to skip title text)
 * @returns {string} Detected authors string, or "Unknown Authors"
 */
export function detectAuthorsFromFontData(fontItems, detectedTitle = "") {
  if (!fontItems || fontItems.length === 0) return "Unknown Authors";

  const valid = fontItems.filter(i => i.str && i.str.trim().length > 0);
  if (valid.length === 0) return "Unknown Authors";

  // --- Step 1: Find the title's Y-position range ---
  const maxY = Math.max(...valid.map(i => i.y));
  const minY = Math.min(...valid.map(i => i.y));
  const pageHeight = maxY - minY;
  if (pageHeight < 50) return "Unknown Authors";

  // Title items: largest font in top 55% of page
  const topItems = valid.filter(i => i.y >= minY + pageHeight * 0.45);
  if (topItems.length === 0) return "Unknown Authors";
  const titleHeight = Math.max(...topItems.map(i => i.height));
  const titleItems = topItems.filter(i => i.height >= titleHeight - 2);
  const titleBottomY = Math.min(...titleItems.map(i => i.y)); // lowest title line (in PDF Y coords, lower = smaller Y)

  // --- Step 2: Find the abstract/intro Y-position (marks author zone end) ---
  const abstractPatterns = [
    /^abstract$/i,
    /^1\.?\s*introduction$/i,
    /^keywords?:?$/i,
    /^i\.\s*introduction$/i,
  ];
  let abstractY = minY; // fallback: bottom of page
  for (const item of valid) {
    if (abstractPatterns.some(p => p.test(item.str.trim()))) {
      abstractY = item.y;
      break;
    }
  }
  // If no abstract found, use 35% down from title
  if (abstractY <= minY) {
    abstractY = titleBottomY - pageHeight * 0.35;
  }

  // --- Step 3: Collect all text between title bottom and abstract ---
  // Author zone: below title (Y < titleBottomY) and above abstract (Y > abstractY)
  const authorZone = valid.filter(i => {
    return i.y < titleBottomY - 3 && i.y > abstractY + 3;
  });

  if (authorZone.length === 0) return "Unknown Authors";

  // --- Step 4: Filter out non-author items ---
  const skipPatterns = [
    /doi:/i,
    /https?:\/\//i,
    /©|copyright/i,
    /received:|accepted:|published:|revised:|edited\s+by|submitted/i,
    /correspondence|email:|e-mail/i,
    /^abstract$/i,
    /^keywords?:?$/i,
    /university|institute|department|school|college|laboratory|center|centre/i,
    /faculty\s+of|school\s+of|dept\.|department\s+of/i,
    /journal\s+of|proceedings|conference\s+on|transactions/i,
    /vol\.|issue\s+|pp\.|issn|isbn/i,
    /mdpi|elsevier|springer|wiley|ieee|acm|arxiv|orcid/i,
    /@/, // email addresses
    /article|open\s+access|creative\s+commons|license/i,
    /^\d+$/, // pure numbers
    /^\*+$/, // pure asterisks
    /orcid\.org/i,
    /^\(?\d{4}\)?$/, // year
  ];

  const authorCandidates = authorZone.filter(i => {
    const text = i.str.trim();
    if (text.length < 2) return false;
    if (skipPatterns.some(p => p.test(text))) return false;
    return true;
  });

  if (authorCandidates.length === 0) return "Unknown Authors";

  // --- Step 5: Group into lines by Y proximity ---
  const lines = [];
  const sortedCandidates = [...authorCandidates].sort((a, b) => b.y - a.y || a.x - b.x);

  for (const item of sortedCandidates) {
    const existingLine = lines.find(l => Math.abs(l.y - item.y) < 5);
    if (existingLine) {
      existingLine.parts.push(item);
    } else {
      lines.push({ y: item.y, parts: [item] });
    }
  }

  // Sort lines top-to-bottom (descending Y in PDF coords)
  lines.sort((a, b) => b.y - a.y);

  // --- Step 6: Score lines — prefer lines with name-like text ---
  // A "name line" typically has capitalized words, commas, "and", no long sentences
  const nameLinePattern = /^[A-Z\u00C0-\u024F][a-z\u00C0-\u024F]+/; // starts with capitalized word
  const scoredLines = lines.map(line => {
    const text = line.parts
      .sort((a, b) => a.x - b.x)
      .map(p => p.str.trim())
      .filter(Boolean)
      .join(" ");
    
    let score = 0;
    // Bonus: contains comma (author separator)
    if (/,/.test(text)) score += 2;
    // Bonus: contains "and" (author connector)
    if (/\band\b/i.test(text)) score += 2;
    // Bonus: starts with capital letter
    if (nameLinePattern.test(text)) score += 1;
    // Bonus: short-ish line (names are typically < 200 chars)
    if (text.length < 200) score += 1;
    // Penalty: looks like an affiliation (long text with institution keywords)
    if (text.length > 100 && /[a-z]{15,}/.test(text)) score -= 3;

    return { text, score, y: line.y };
  });

  // Take lines with score >= 1, up to 3 lines
  const authorLines = scoredLines
    .filter(l => l.score >= 1 && l.text.length > 2)
    .slice(0, 3)
    .map(l => l.text);

  // Fallback: just take the first 2 lines if scoring found nothing
  if (authorLines.length === 0) {
    const fallback = scoredLines.slice(0, 2).map(l => l.text).filter(t => t.length > 2);
    if (fallback.length === 0) return "Unknown Authors";
    authorLines.push(...fallback);
  }

  // --- Step 7: Clean up the raw author string ---
  let authorsRaw = authorLines.join(", ").replace(/\s+/g, " ").trim();

  // Remove superscripts, daggers, section marks
  authorsRaw = authorsRaw
    .replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰†‡§∥¶⊥]/g, "")
    .replace(/\s*[*†‡]+\s*/g, " ")
    // Remove inline superscript numbers like "Author1,2" or "Author 1"
    .replace(/([A-Za-z])\s*(\d{1,2})\s*(?=[,\s]|$)/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/,\s*,/g, ",") // double commas
    .replace(/^[,\s]+|[,\s]+$/g, "") // leading/trailing
    .trim();

  if (authorsRaw.length < 3 || authorsRaw.length > 500) return "Unknown Authors";

  return authorsRaw;
}

let ocrWorkerPromise = null;

/**
 * Lazily initializes and caches a singleton Tesseract.js OCR worker.
 */
async function getOcrWorker() {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = (async () => {
      const { createWorker } = await import("tesseract.js");
      return await createWorker("eng");
    })().catch((err) => {
      ocrWorkerPromise = null;
      throw err;
    });
  }
  return ocrWorkerPromise;
}

/**
 * Runs local client-side OCR on a rendered PDF page canvas or image source.
 * @param {HTMLCanvasElement|string|Blob} imageSource
 * @returns {Promise<string>}
 */
export async function extractTextWithOCR(imageSource) {
  const worker = await getOcrWorker();
  const { data } = await worker.recognize(imageSource);
  return (data?.text || "").trim();
}

/**
 * Parses a PDF file and returns its pages, text content, and first-page font data for title detection.
 * Automatically falls back to local Tesseract OCR for scanned / image-only pages.
 * @param {File} file File object from uploader
 * @param {Function} [onProgress] Progress callback: (pageNumber, totalPages) => void
 * @returns {Promise<{title: string, pageCount: number, pages: Array<{page: number, text: string, layout?: string}>, firstPageFontItems: Array}>}
 */
export async function parsePdfFile(file, onProgress) {
  const pdfjsLib = await loadPdfJS();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target.result;

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const pageCount = pdf.numPages;
        const pages = [];
        let firstPageFontItems = [];

        // Extract all pages concurrently, with local Tesseract OCR fallback for scanned pages
        const pageResults = await Promise.all(
          Array.from({ length: pageCount }, async (_, idx) => {
            const i = idx + 1;
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const rawItems = textContent.items || [];
            const items = rawItems.filter((it) => it.str && it.str.trim().length > 0);
            const charCount = items.reduce((sum, it) => sum + it.str.trim().length, 0);

            // Capture rich font-size data for first page (for title & author detection)
            if (i === 1) {
              firstPageFontItems = rawItems
                .filter((item) => item && item.transform && item.transform.length >= 6)
                .map((item) => ({
                  str: item.str || "",
                  height: item.height || Math.abs(item.transform[3]) || 0,
                  y: item.transform[5],
                  x: item.transform[4],
                }));
            }

            // If page has virtually no embedded text layer (scanned PDF), render & run local OCR
            if ((items.length === 0 || charCount < 40) && typeof document !== "undefined") {
              try {
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement("canvas");
                canvas.width = Math.floor(viewport.width);
                canvas.height = Math.floor(viewport.height);
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  await page.render({ canvasContext: ctx, viewport }).promise;
                  const ocrText = await extractTextWithOCR(canvas);
                  canvas.width = 0;
                  canvas.height = 0;
                  if (onProgress) onProgress(i, pageCount);
                  return { pageNum: i, items, ocrText, isOcr: ocrText.length > 10 };
                }
              } catch (ocrErr) {
                console.warn(`OCR fallback failed on page ${i}:`, ocrErr);
              }
            }

            if (onProgress) onProgress(i, pageCount);
            return { pageNum: i, items, ocrText: "", isOcr: false };
          })
        );

        pageResults.sort((a, b) => a.pageNum - b.pageNum);

        for (const { pageNum: i, items, ocrText, isOcr } of pageResults) {
          if (isOcr && ocrText) {
            pages.push({ page: i, text: ocrText, layout: "ocr-scanned" });
            continue;
          }
          if (items.length === 0) {
            pages.push({ page: i, text: "", layout: "single-column" });
            continue;
          }

          // Determine page bounds and median line height
          let minX = Infinity;
          let maxX = -Infinity;
          let minY = Infinity;
          let maxY = -Infinity;
          const heights = [];

          items.forEach((item) => {
            if (!item.transform || item.transform.length < 6) return;
            const x = item.transform[4];
            const y = item.transform[5];
            const h = item.height || Math.abs(item.transform[3]) || 10;
            const w = item.width || (item.str.length * (h * 0.52));
            if (x < minX) minX = x;
            if (x + w > maxX) maxX = x + w;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            if (h > 2 && h < 48) heights.push(h);
          });

          heights.sort((a, b) => a - b);
          const medianHeight = heights.length > 0 ? heights[Math.floor(heights.length / 2)] : 10;
          const pageWidth = Math.max(maxX - minX, 1);
          const pageHeight = Math.max(maxY - minY, 1);
          const midX = (minX + maxX) / 2;

          // Filter out isolated running page numbers in top/bottom 4% margins
          const contentItems = items.filter((item) => {
            if (!item.transform || item.transform.length < 6) return false;
            const y = item.transform[5];
            const str = item.str.trim();
            const isMargin = y > maxY - pageHeight * 0.04 || y < minY + pageHeight * 0.04;
            if (isMargin && (/^\d{1,4}$/.test(str) || /^page\s+\d+$/i.test(str))) {
              return false;
            }
            return true;
          });

          const activeItems = contentItems.length > 0 ? contentItems : items;

          // Group items into horizontal Y-lines (tolerance based on median font height)
          const lineTolerance = Math.max(4, medianHeight * 0.45);
          const sortedByY = [...activeItems].sort((a, b) => (b.transform?.[5] || 0) - (a.transform?.[5] || 0));
          const yLines = [];
          for (const item of sortedByY) {
            const y = item.transform?.[5] || 0;
            const lastLine = yLines[yLines.length - 1];
            if (lastLine && Math.abs(lastLine.y - y) <= lineTolerance) {
              lastLine.items.push(item);
            } else {
              yLines.push({ y, items: [item] });
            }
          }

          // Reconstruct a single column/band of items into clean de-hyphenated paragraphs
          const reconstructColumnText = (colItems) => {
            if (!colItems || colItems.length === 0) return "";
            const sorted = [...colItems].sort((a, b) => {
              const yDiff = (b.transform?.[5] || 0) - (a.transform?.[5] || 0);
              if (Math.abs(yDiff) <= lineTolerance) {
                return (a.transform?.[4] || 0) - (b.transform?.[4] || 0);
              }
              return yDiff;
            });

            // Build logical lines first
            const lines = [];
            let currLine = { y: sorted[0].transform?.[5] ?? 0, text: sorted[0].str };
            for (let idx = 1; idx < sorted.length; idx++) {
              const item = sorted[idx];
              const y = item.transform?.[5] ?? 0;
              if (Math.abs(y - currLine.y) <= lineTolerance) {
                const needsSpace = currLine.text.length > 0 && !currLine.text.endsWith(" ") && !item.str.startsWith(" ");
                currLine.text += (needsSpace ? " " : "") + item.str;
              } else {
                lines.push(currLine);
                currLine = { y, text: item.str };
              }
            }
            lines.push(currLine);

            // Join lines into paragraphs with soft-hyphen de-wrapping
            let out = "";
            for (let idx = 0; idx < lines.length; idx++) {
              const lineText = lines[idx].text.trim();
              if (!lineText) continue;

              if (out.length === 0) {
                out = lineText;
                continue;
              }

              const prevY = lines[idx - 1].y;
              const dy = Math.abs(prevY - lines[idx].y);
              const isParagraphBreak = dy > medianHeight * 1.65;

              if (isParagraphBreak) {
                out += "\n\n" + lineText;
              } else if (/[a-zA-Z]-$/.test(out) && /^[a-z]/.test(lineText)) {
                // De-hyphenate wrapped academic words (e.g., "transfor-\nmer" -> "transformer")
                out = out.slice(0, -1) + lineText;
              } else {
                out += " " + lineText;
              }
            }
            return out;
          };

          // Detect whether a Y-line spans across the central gutter or is split into columns
          const isLineSpanning = (line) => {
            const lineItems = [...line.items].sort((a, b) => (a.transform?.[4] || 0) - (b.transform?.[4] || 0));
            const first = lineItems[0];
            const last = lineItems[lineItems.length - 1];
            const startX = first.transform?.[4] || 0;
            const lastW = last.width || (last.str.length * (medianHeight * 0.52));
            const endX = (last.transform?.[4] || 0) + lastW;

            // Check if any single item crosses midX significantly
            const hasCrossingItem = lineItems.some((it) => {
              const x = it.transform?.[4] || 0;
              const w = it.width || (it.str.length * (medianHeight * 0.52));
              return x < midX - pageWidth * 0.05 && (x + w) > midX + pageWidth * 0.05;
            });
            if (hasCrossingItem) return true;

            // If line has items on both sides, check if there is a clear column gutter around midX
            const hasLeft = lineItems.some((it) => (it.transform?.[4] || 0) + ((it.width || 20) / 2) < midX - 8);
            const hasRight = lineItems.some((it) => (it.transform?.[4] || 0) > midX + 8);
            if (hasLeft && hasRight) {
              // Measure largest horizontal gap near the middle
              let maxGapNearMid = 0;
              for (let k = 0; k < lineItems.length - 1; k++) {
                const aEnd = (lineItems[k].transform?.[4] || 0) + (lineItems[k].width || lineItems[k].str.length * 5);
                const bStart = lineItems[k + 1].transform?.[4] || 0;
                const gap = bStart - aEnd;
                if (aEnd <= midX + 30 && bStart >= midX - 30 && gap > maxGapNearMid) {
                  maxGapNearMid = gap;
                }
              }
              // Small space = single-column sentence; large gutter = multi-column row
              return maxGapNearMid < medianHeight * 1.8;
            }

            // Centered wide title/heading spanning across midX
            return startX < midX - pageWidth * 0.08 && endX > midX + pageWidth * 0.08;
          };

          // Classify page overall layout and segment into horizontal bands
          const spanningFlags = yLines.map(isLineSpanning);
          const leftOnlyCount = yLines.filter((l) => l.items.every((it) => (it.transform?.[4] || 0) < midX - 10)).length;
          const rightOnlyCount = yLines.filter((l) => l.items.every((it) => (it.transform?.[4] || 0) > midX + 5)).length;
          const spanningCount = spanningFlags.filter(Boolean).length;

          const isMultiColumnPage =
            (spanningCount / Math.max(yLines.length, 1) < 0.35) &&
            (leftOnlyCount >= 4 && rightOnlyCount >= 4);

          let text = "";
          let layout = "single-column";

          if (!isMultiColumnPage) {
            text = reconstructColumnText(activeItems);
            layout = "single-column";
          } else {
            // Segment into contiguous single-column (spanning) and multi-column bands
            const bands = [];
            let currentBand = null;

            for (let idx = 0; idx < yLines.length; idx++) {
              const bandType = spanningFlags[idx] ? "single" : "multi";
              if (!currentBand || currentBand.type !== bandType) {
                currentBand = { type: bandType, items: [...yLines[idx].items] };
                bands.push(currentBand);
              } else {
                currentBand.items.push(...yLines[idx].items);
              }
            }

            // Merge tiny 1-line "single" bands inside multi-column regions if they are just short artifacts
            const bandTexts = bands.map((band) => {
              if (band.type === "single") {
                return reconstructColumnText(band.items);
              }
              // Check for 3-column vs 2-column within this band
              const third1 = minX + pageWidth / 3;
              const third2 = minX + (2 * pageWidth) / 3;
              const midBandCount = band.items.filter((it) => {
                const cx = (it.transform?.[4] || 0) + ((it.width || 10) / 2);
                return cx > third1 + 10 && cx < third2 - 10;
              }).length;
              const isThreeCol = band.items.length > 24 && midBandCount > band.items.length * 0.2 &&
                band.items.every((it) => (it.width || 0) < pageWidth * 0.38);

              if (isThreeCol) {
                const c1 = [];
                const c2 = [];
                const c3 = [];
                for (const it of band.items) {
                  const cx = (it.transform?.[4] || 0) + ((it.width || 10) / 2);
                  if (cx < third1) c1.push(it);
                  else if (cx < third2) c2.push(it);
                  else c3.push(it);
                }
                return [reconstructColumnText(c1), reconstructColumnText(c2), reconstructColumnText(c3)]
                  .filter((t) => t.trim().length > 0)
                  .join("\n\n");
              }

              const leftCol = [];
              const rightCol = [];
              for (const it of band.items) {
                const x = it.transform?.[4] || 0;
                if (x < midX) leftCol.push(it);
                else rightCol.push(it);
              }
              return [reconstructColumnText(leftCol), reconstructColumnText(rightCol)]
                .filter((t) => t.trim().length > 0)
                .join("\n\n");
            });

            text = bandTexts.filter((t) => t.trim().length > 0).join("\n\n");
            layout = bands.some((b) => b.type === "single") ? "mixed" : "multi-column";
          }

          pages.push({ page: i, text: text.trim(), layout });
        }

        resolve({
          title: file.name.replace(/\.[^/.]+$/, ""), // filename fallback
          pageCount,
          pages,
          firstPageFontItems,
        });
      } catch (error) {
        console.error("PDF Parsing Error:", error);
        reject(new Error("Could not parse PDF content: " + error.message));
      }
    };

    reader.onerror = (err) => {
      reject(new Error("FileReader failed: " + err.message));
    };

    reader.readAsArrayBuffer(file);
  });
}
