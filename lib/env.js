try { process.loadEnvFile(process.env.ENV_FILE || '.env'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
