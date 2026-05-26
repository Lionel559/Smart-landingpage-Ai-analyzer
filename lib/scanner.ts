import axios from "axios";
import * as cheerio from "cheerio";

function cleanText(txt: string) {
  return txt.replace(/\s+/g, " ").replace(/\n/g, "").trim();
}

function containsWords(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

export async function scanWebsite(url: string) {
  try {
    const response = await axios.get(url, {
      timeout: 25000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const pageTitle = cleanText($("title").text() || "");
    const metaDescription = cleanText(
      $('meta[name="description"]').attr("content") || ""
    );

    const h1Text = cleanText($("h1").first().text() || "");
    const h2Count = $("h2").length;
    const h3Count = $("h3").length;
    const pCount = $("p").length;

    const subHeadline =
      cleanText($("h1").first().next("p").text()) ||
      cleanText($("header p").first().text()) ||
      cleanText($("section p").first().text());

    const bodyText = cleanText($("body").text().toLowerCase());

    const ctaElements = $("button, a")
      .map((i, el) => cleanText($(el).text()))
      .get()
      .filter((txt) => {
        const t = txt.toLowerCase();
        return (
          t.includes("get") ||
          t.includes("start") ||
          t.includes("book") ||
          t.includes("buy") ||
          t.includes("try") ||
          t.includes("sign") ||
          t.includes("contact") ||
          t.includes("schedule") ||
          t.includes("demo") ||
          t.includes("free") ||
          t.includes("listen") ||
          t.includes("stream") ||
          t.includes("watch") ||
          t.includes("tickets") ||
          t.includes("apply") ||
          t.includes("enroll") ||
          t.includes("admission") ||
          t.includes("donate") ||
          t.includes("volunteer") ||
          t.includes("order") ||
          t.includes("reserve") ||
          t.includes("menu") ||
          t.includes("appointment") ||
          t.includes("quote") ||
          t.includes("listing") ||
          t.includes("shop") ||
          t.includes("cart") ||
          t.includes("subscribe")
        );
      });

    const buttonCount = ctaElements.length;

    const navLinks = $("nav a")
      .map((i, el) => cleanText($(el).text()))
      .get()
      .filter(Boolean);

    const imageCount = $("img").length;
    const formCount = $("form").length;
    const inputCount = $("input, textarea, select").length;

    const hasTestimonials = containsWords(bodyText, [
      "testimonial",
      "reviews",
      "what our clients say",
      "trusted by",
      "customers love",
      "success stories",
      "case studies",
      "clients",
    ]);

    const hasTrustBadges = containsWords(bodyText, [
      "secure",
      "trusted",
      "verified",
      "guarantee",
      "protected",
      "ssl",
      "money back",
      "encrypted",
      "risk free",
    ]);

    const hasPricing = containsWords(bodyText, [
      "$",
      "pricing",
      "plans",
      "/month",
      "/yr",
      "subscription",
      "lifetime",
    ]);

    const hasFAQ = containsWords(bodyText, [
      "frequently asked questions",
      "faq",
      "questions",
    ]);

    const hasGuarantee = containsWords(bodyText, [
      "money back",
      "guarantee",
      "risk free",
      "cancel anytime",
    ]);

    const urgencySignals = containsWords(bodyText, [
      "limited",
      "today only",
      "offer ends",
      "deadline",
      "spots left",
      "act now",
      "expires",
    ]);

    const socialProofSignals = containsWords(bodyText, [
      "users",
      "customers",
      "businesses",
      "brands",
      "teams",
      "companies use",
      "trusted by",
    ]);

    const footerText = cleanText($("footer").text().toLowerCase());
    const footerCta =
      footerText.includes("contact") ||
      footerText.includes("book") ||
      footerText.includes("start") ||
      footerText.includes("demo");

    const wordCount = bodyText.split(" ").length;

    return {
      pageTitle,
      metaDescription,
      h1Text,
      subHeadline,
      h2Count,
      h3Count,
      pCount,
      buttonCount,
      ctaTexts: ctaElements.slice(0, 8),
      navLinks: navLinks.slice(0, 10),
      imageCount,
      formCount,
      inputCount,
      hasTestimonials,
      hasTrustBadges,
      hasPricing,
      hasFAQ,
      hasGuarantee,
      urgencySignals,
      socialProofSignals,
      footerCta,
      wordCount,
      bodyTextSnippet: bodyText.slice(0, 1500),
    };
  } catch (error) {
    console.log("SCANNER ERROR:", error);
    return null;
  }
}
