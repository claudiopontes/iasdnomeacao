// Configuração do PM2 para SaveInCloud / Jelastic (stack Node.js + PM2).
// O build acontece no "postinstall" do package.json, logo após o npm install do deploy.
module.exports = {
  apps: [{
    name: 'iasdnomeacao',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p ' + (process.env.PORT || 8080),
    env: { NODE_ENV: 'production' },
  }],
};
