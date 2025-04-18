module.exports = {
    presets: [
      [
        'next/babel',
        {
          // Force the modern “automatic” JSX runtime in tests
          'preset-react': { runtime: 'automatic' }
        }
      ]
    ]
  };
  