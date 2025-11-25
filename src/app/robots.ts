// app/robots.ts
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/admin", "/admin/gupload", "/admin/login", ],
      },
    ],
    sitemap: "https://mrandmisstreat.com.ng/sitemap.xml",
  };
}
