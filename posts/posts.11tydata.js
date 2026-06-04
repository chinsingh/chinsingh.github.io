module.exports = {
  layout: "post.njk",
  eleventyComputed: {
    eleventyExcludeFromCollections: (data) =>
      data.draft ? true : data.eleventyExcludeFromCollections,
    permalink: (data) => (data.draft ? false : data.permalink),
  },
};
