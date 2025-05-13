#!/bin/bash

CERT_PATH="/etc/letsencrypt/live/${DOMAIN}"

while true; do
    MYIP=$(curl -s ifconfig.me)
    if [[ $MYIP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        curl "https://dynamicdns.park-your-domain.com/update?host=@&domain=${DOMAIN}&password=${DYNAMIC_DNS_PASSWORD}&ip=$MYIP"
        curl "https://dynamicdns.park-your-domain.com/update?host=www&domain=${DOMAIN}&password=${DYNAMIC_DNS_PASSWORD}&ip=$MYIP"
        break
    fi
    echo "Waiting for a valid IP..."
    sleep 10
done

mkdir -p /var/www/certbot
mkdir -p /etc/letsencrypt
chown -R www-data:www-data /var/www/certbot

cat > /etc/nginx/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name ${DOMAIN};

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 'OK';
        }
    }
}
EOF

nginx
sleep 60

certbot certonly --webroot -w /var/www/certbot -d ${DOMAIN} --email ${EMAIL} --agree-tos -n --keep-until-expiring

if [ -f /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ] && [ -f /etc/letsencrypt/live/${DOMAIN}/privkey.pem ]; then
    cat > /etc/nginx/nginx.conf << EOF
worker_processes auto;
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    server {
        listen 80;
        server_name ${DOMAIN};

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://\$host\$request_uri;
        }
    }

    server {
        listen 443 ssl;
        server_name ${DOMAIN};

        ssl_certificate ${CERT_PATH}/fullchain.pem;
        ssl_certificate_key ${CERT_PATH}/privkey.pem;

        location / {
            proxy_pass http://localhost:8080;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

    nginx -s reload
else
    echo "Not able to get SSL certificate. Check logs for more details."
fi

/usr/local/bin/app