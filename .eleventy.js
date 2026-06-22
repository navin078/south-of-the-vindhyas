module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("south-india-railways.geojson");
  eleventyConfig.addPassthroughCopy("index.html");
  return {
    dir: {
      input: ".",
      output: "_site"
    }
  };
};
