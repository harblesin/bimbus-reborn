module.exports = {
    apps: [
      {
        name: 'bimbus-reborn',         // Name of your application
        script: 'main.ts',              // Entry point of your app (TypeScript file)
        interpreter: 'npx',
        interpreter_args: 'ts-node',        // Specifies the interpreter to use
        watch: true,                   // Optional: Watch files for changes and restart
        env: {
          NODE_ENV: 'development',    // Environment variables for development
        },
        env_production: {
          NODE_ENV: 'production',     // Environment variables for production
        }
      }
    ]
  };