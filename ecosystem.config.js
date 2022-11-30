module.exports = {
  apps: [
    {
      name: "pokemoniacs-backend",
      script: "./index.js",
      instances: "1",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
