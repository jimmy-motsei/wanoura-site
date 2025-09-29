module.exports = {
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          // Preserve viewBox for responsive scaling
          removeViewBox: false,
          // Keep IDs that might be referenced
          cleanupIds: false,
          // Preserve inline styles for theme consistency
          inlineStyles: false,
          // Keep comments for documentation
          removeComments: false,
          // Preserve metadata for accessibility
          removeMetadata: false,
          // Keep title and desc elements for accessibility
          removeTitle: false,
          removeDesc: false,
        },
      },
    },
    // Remove unused elements but preserve accessibility features
    "removeUnusedNS",
    "removeUselessStrokeAndFill",
    "removeEmptyContainers",
    "removeEmptyText",
    "removeHiddenElems",
    // Optimize paths and shapes
    "convertPathData",
    "convertShapeToPath",
    "mergePaths",
    // Remove empty attributes
    "removeEmptyAttrs",
    // Sort attributes for consistency
    "sortAttrs",
  ],
};

