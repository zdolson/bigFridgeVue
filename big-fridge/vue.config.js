module.exports = {
  runtimeCompiler: true,
  configureWebpack: {
      output: {
          globalObject: 'this',
      },
  },
}
