module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("south-indian-railways.geojson");
  eleventyConfig.addPassthroughCopy("index.html");
  return {
    dir: {
      input: ".",
      output: "_site"
    }
  };
};
