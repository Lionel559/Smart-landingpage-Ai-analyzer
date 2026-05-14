import axios from "axios";

export async function getVisualScan(url: string) {
  try {
    // ✅ PRIMARY screenshot (fast + reliable CDN proxy)
    const primaryScreenshot = `https://image.thum.io/get/width/1400/noanimate/${url}`;

    // ✅ BACKUP screenshot (no auth, less blocking)
    const fallbackScreenshot = `https://api.microlink.io/?url=${encodeURIComponent(
      url
    )}&screenshot=true&meta=false&embed=screenshot.url`;

    let screenshotUrl = "";

    try {
      // Try primary first
      await axios.get(primaryScreenshot, { timeout: 12000 });
      screenshotUrl = primaryScreenshot;
    } catch {
      try {
        // fallback to microlink
        const res = await axios.get(fallbackScreenshot, { timeout: 15000 });
        screenshotUrl = res.data?.data?.screenshot?.url || "";
      } catch {
        screenshotUrl = "";
      }
    }

    // ✅ SIMPLE VISUAL HEURISTICS (still lightweight, but cleaner)
    const urlLower = url.toLowerCase();

    return {
      screenshotUrl,

      aboveFoldLikelyWeak:
        urlLower.includes("blog") ||
        urlLower.includes("article") ||
        urlLower.includes("news"),

      textHeavyHero:
        urlLower.includes("consult") ||
        urlLower.includes("agency") ||
        urlLower.includes("service"),

      lowVisualTrust:
        urlLower.includes("landing") ||
        urlLower.includes("sales"),

      footerCtaMissing:
        urlLower.includes("portfolio") ||
        urlLower.includes("blog"),

      modernDesignLikely:
        urlLower.includes("ai") ||
        urlLower.includes("saas") ||
        urlLower.includes("tech") ||
        urlLower.includes("app"),

      ecommerceLikely:
        urlLower.includes("shop") ||
        urlLower.includes("store") ||
        urlLower.includes("product"),

      fintechLikely:
        urlLower.includes("bank") ||
        urlLower.includes("pay") ||
        urlLower.includes("finance"),
    };
  } catch (error) {
    console.log("VISION SCAN ERROR:", error);

    return {
      screenshotUrl: "",
      aboveFoldLikelyWeak: false,
      textHeavyHero: false,
      lowVisualTrust: false,
      footerCtaMissing: false,
      modernDesignLikely: false,
      ecommerceLikely: false,
      fintechLikely: false,
    };
  }
}