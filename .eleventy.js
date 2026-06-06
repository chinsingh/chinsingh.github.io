const rssPlugin = require("@11ty/eleventy-plugin-rss");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const { renderD2 } = require("./_build/d2");
const { youtubeId } = require("./_build/youtube");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(rssPlugin);
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.amendLibrary("md", (mdLib) => {
    const defaultFence = mdLib.renderer.rules.fence;
    mdLib.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      if (token.info.trim() === "d2") {
        const svg = renderD2(token.content);
        return `<figure class="diagram">${svg}</figure>`;
      }
      return defaultFence(tokens, idx, options, env, self);
    };
  });

  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addWatchTarget("js/");
  eleventyConfig.addPassthroughCopy("posts/**/*.{jpg,jpeg,png,gif,webp,svg,musicxml,wav,mp3,m4a}");

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("posts/**/index.md").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("cards", (api) =>
    api.getFilteredByGlob("stream/cards/*.md").sort((a, b) => b.date - a.date)
  );

  // Render markdown string to HTML
  const md = require("markdown-it")();
  eleventyConfig.addFilter("markdown", (content) => md.render(content));

  // Normalize section field to always be an array
  eleventyConfig.addFilter("asArray", (val) =>
    !val ? [] : Array.isArray(val) ? val : [val]
  );

  eleventyConfig.addFilter("youtubeId", youtubeId);

  // Collection: categories sorted by their most recent post
  eleventyConfig.addCollection("categories", (api) => {
    const posts = api.getFilteredByGlob("posts/**/index.md");
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
