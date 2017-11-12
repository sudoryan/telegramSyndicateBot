# telegramBot

## Deploy Locally

Set up env_vars in .env.json

    {
         "NODE_ENV": "prod",
         "ICOBOT_TOKEN": "",
         "PORT": "8443",
         "FIREBASE_URL": "",
         "type": "",
         "project_id": "",
         "private_key_id": "",
         "private_key": "",
         "client_email": "",
         "client_id": "",
         "auth_uri": "",
         "token_uri": "",
         "auth_provider_x509_cert_url": "",
         "client_x509_cert_url": ""
    }

Install and run ngrok

    ./ngrok http 8443

Run app

    NODE_ENV=dev node app.js
    
Set Telegram Webhook

    curl 'https://api.telegram.org/bot[bot_token]/setWebhook?url=[ngrok_https_url]:443/[bot_token]'
    
Done

## Deploy to Zeit

Set up env_vars in now.json

    {
        "env": {
            "NODE_ENV": "prod",
            "ICOBOT_TOKEN": "",
            "PORT": "8443",
            "FIREBASE_URL": "",
            "type": "",
            "project_id": "",
            "private_key_id": "",
            "private_key": "",
            "client_email": "",
            "client_id": "",
            "auth_uri": "",
            "token_uri": "",
            "auth_provider_x509_cert_url": "",
            "client_x509_cert_url": ""
        }
    }

Install now

    npm i -g --unsafe-perm now

Login now

    now login

Deploy
  
    now

Set Telegram Webhook

    curl 'https://api.telegram.org/bot[bot_token]/setWebhook?url=[now_url]:443/[bot_token]'

Done
