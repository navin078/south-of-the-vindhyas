module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("data");
  eleventyConfig.addPassthroughCopy("scripts");

  eleventyConfig.addFilter("htmlDateString", function(date) {
    return new Date(date).toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("readableDate", function(date) {
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(date));
  });

  eleventyConfig.addFilter("jsonify", function(value) {
    return JSON.stringify(value);
  });

  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/**/*.md").sort((a, b) => {
      return b.date - a.date;
    });
  });

  return {
    pathPrefix: "/south-of-the-vindhyas/",
    dir: {
      input: ".",
      output: "_site"
    }
  };
};
