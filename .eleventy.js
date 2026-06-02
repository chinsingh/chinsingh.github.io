const rssPlugin = require("@11ty/eleventy-plugin-rss");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(rssPlugin);
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addWatchTarget("js/");
  eleventyConfig.addPassthroughCopy("posts/**/*.{jpg,jpeg,png,gif,webp,svg}");
  eleventyConfig.addPassthroughCopy("scores/**/*.musicxml");
  eleventyConfig.addPassthroughCopy("scores/**/*.wav");

  // Collection: all posts and scores sorted newest first
  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob(["posts/**/index.md", "scores/**/index.md"]).sort((a, b) => b.date - a.date)
  );

  // Render markdown string to HTML
  const md = require("markdown-it")();
  eleventyConfig.addFilter("markdown", (content) => md.render(content));

  // Normalize section field to always be an array
  eleventyConfig.addFilter("asArray", (val) =>
    !val ? [] : Array.isArray(val) ? val : [val]
  );

  // Collection: categories sorted by their most recent post
  eleventyConfig.addCollection("categories", (api) => {
    const posts = api.getFilteredByGlob(["posts/**/index.md", "scores/**/index.md"]);
    const latestDate = {};
    for (const post of posts) {
      const cats = post.data.section;
      if (!cats) continue;
      const arr = Array.isArray(cats) ? cats : [cats];
      for (const cat of arr) {
        if (!latestDate[cat] || post.date > latestDate[cat]) {
          latestDate[cat] = post.date;
        }
      }
    }
    return Object.keys(latestDate).sort((a, b) => latestDate[b] - latestDate[a]);
  });


  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
  };
};
