---
title: "Project Deployment"
date: "2025-12-24"
excerpt: "minio的docker部署"
tags: ["Java", "Spring", "Network", "MessageQueue", "AI"]
category: "Backend"
---

### minio的docker部署

```bash
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -v /data/minio/data:/data \
  -v /data/minio/config:/root/.minio \
  -e "MINIO_ROOT_USER=haibara" \
  -e "MINIO_ROOT_PASSWORD=Ww249260523.." \
  quay.io/minio/minio server /data --console-address ":9001"
```

### 设置minio的bucket为public

```bash
# 安装minio客户端工具mc：
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
mv mc /usr/local/bin/
# 配置连接：
mc alias set myminio http://154.94.235.178:9000 admin admin123
# 设置bucket公开：
mc anonymous set public myminio/haibara-blog
```

### nginx包结构

```bash
/data/nginx/{html, blog, conf{conf.d{blog.conf}, nginx.conf, logs}}
```



### nginx部署docker命令

```bash
docker run -d \
  --name nginx \
  -p 80:80 \
  -p 443:443 \
  -v /data/nginx/conf/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v /data/nginx/conf/conf.d:/etc/nginx/conf.d:ro \
  -v /data/nginx/html:/usr/share/nginx/html \
  -v /data/nginx/logs:/var/log/nginx \
  -v /data/nginx/ssl:/etc/nginx/ssl:ro \
  --log-opt max-size=100m \
  --log-opt max-file=5 \
  nginx:latest

```

### nginx主配置

```bash
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    keepalive_timeout  65;

    # 全局文件上传大小限制 - 10MB
    client_max_body_size 10M;

    # 添加WebSocket映射支持
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }

    # ⬇️ 关键点：加载所有子配置文件
    include /etc/nginx/conf.d/*.conf;
}
```

### nginx 反向代理

```bash
server {
    listen 80;
    server_name haikari.top www.haikari.top;
    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
    }
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 80;
    server_name sherry.haikari.top;
    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
    }
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 80;
    server_name blog.admin.haikari.top;
    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
    }
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 80;
    server_name minio.haikari.top;
    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
        try_files $uri =404;
    }
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# ==================== 主域名 HTTPS ====================
server {
    listen 443 ssl;
    http2 on;
    server_name haikari.top www.haikari.top;

    ssl_certificate /etc/nginx/ssl/haikari.top.crt;
    ssl_certificate_key /etc/nginx/ssl/haikari.top.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html =404;
    }

    # MinIO文件服务代理
    location /files/ {
        proxy_pass http://154.94.235.178:9000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # MinIO存储桶代理
    location /haibara-blog/ {
        proxy_pass http://154.94.235.178:9000/haibara-blog/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://172.17.0.1:8066/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端直接路由代理
    location ~ ^/(websiteInfo|user|banners|tag|article|comment|link|category|menu|leaveWord|favorite|treeHole|role|permission|log|loginLog|blackList|oauth|public|like|photo|monitor)(/.*)?$ {
        proxy_pass http://172.17.0.1:8066$request_uri;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 其他服务代理
    location /wapi/ {
        proxy_pass http://172.17.0.1:3000/;
    }
}

# ==================== 前台博客 HTTPS ====================
server {
    listen 443 ssl;
    http2 on;
    server_name sherry.haikari.top;

    ssl_certificate /etc/nginx/ssl/sherry.haikari.top.crt;
    ssl_certificate_key /etc/nginx/ssl/sherry.haikari.top.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 前端静态文件
    location / {
        root /usr/share/nginx/html/blog;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # MinIO存储桶代理
    location /haibara-blog/ {
        proxy_pass http://154.94.235.178:9000/haibara-blog/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://172.17.0.1:8066/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /wapi/ {
        proxy_pass http://172.17.0.1:3000/;
    }
}

# ==================== 管理端 HTTPS ====================
server {
    listen 443 ssl;
    http2 on;
    server_name blog.admin.haikari.top;

    ssl_certificate /etc/nginx/ssl/blog.admin.haikari.top.crt;
    ssl_certificate_key /etc/nginx/ssl/blog.admin.haikari.top.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 前端静态文件
    location / {
        root /usr/share/nginx/html/admin;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # MinIO存储桶代理
    location /haibara-blog/ {
        proxy_pass http://154.94.235.178:9000/haibara-blog/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 导出功能优化配置
    location /api/export/ {
        proxy_pass http://172.17.0.1:8066/export/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        proxy_buffering off;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://172.17.0.1:8066/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ==================== MinIO HTTPS ====================
server {
    listen 443 ssl;
    http2 on;
    server_name minio.haikari.top;

    ssl_certificate /etc/nginx/ssl/minio.haikari.top.crt;
    ssl_certificate_key /etc/nginx/ssl/minio.haikari.top.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # WebSocket连接支持
    location /ws/ {
        proxy_pass http://154.94.235.178:9001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # MinIO Web管理界面
    location / {
        proxy_pass http://154.94.235.178:9001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # MinIO API和文件访问
    location /haibara-blog/ {
        proxy_pass http://154.94.235.178:9000/haibara-blog/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 重新加载Nginx

```bash
# 测试配置文件语法
docker exec nginx nginx -t

# 重新加载配置
docker exec nginx nginx -s reload

# 或者重启容器
docker restart nginx
```

### ssl证书申请

```bash
# 1. 安装Certbot
apt update && apt install -y certbot

# 2. 申请证书
# 申请所有域名的证书
certbot certonly --webroot \
  -w /data/nginx/html \
  -d haikari.top \
  -d www.haikari.top \
  -d sherry.haikari.top \
  -d blog.admin.haikari.top \
  -d minio.haikari.top \
  --email Haibara406@gmail.com \
  --agree-tos \
  --non-interactive

# 临时nginx配置：
cat > /data/nginx/conf/conf.d/http-only.conf << 'EOF'
server {
listen 80;
server_name haikari.top www.haikari.top sherry.haikari.top blog.admin.haikari.top minio.haikari.top;

    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
        try_files $uri =404;
    }
    
    location / {
        return 200 "Waiting for SSL certificate...";
        add_header Content-Type text/plain;
    }
}
EOF


# 3. 复制证书到Nginx目录
# 创建ssl目录
mkdir -p /data/nginx/ssl

# 复制haikari.top证书
cp /etc/letsencrypt/live/haikari.top/fullchain.pem /data/nginx/ssl/haikari.top.crt
cp /etc/letsencrypt/live/haikari.top/privkey.pem /data/nginx/ssl/haikari.top.key

# 复制sherry.haikari.top证书
ln -s /data/nginx/ssl/haikari.top.crt /data/nginx/ssl/sherry.haikari.top.crt
ln -s /data/nginx/ssl/haikari.top.key /data/nginx/ssl/sherry.haikari.top.key

# 复制blog.admin.haikari.top证书
ln -s /data/nginx/ssl/haikari.top.crt /data/nginx/ssl/blog.admin.haikari.top.crt
ln -s /data/nginx/ssl/haikari.top.key /data/nginx/ssl/blog.admin.haikari.top.key

# 复制minio.haikari.top证书
ln -s /data/nginx/ssl/haikari.top.crt /data/nginx/ssl/minio.haikari.top.crt
ln -s /data/nginx/ssl/haikari.top.key /data/nginx/ssl/minio.haikari.top.key

# 设置权限
chmod 644 /data/nginx/ssl/*.crt
chmod 600 /data/nginx/ssl/*.key

# 4. 重启Nginx
docker restart nginx

# 5. 设置自动续期（证书90天有效）
# 创建续期脚本
cat > /root/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet

# 只需要复制一套证书
cp /etc/letsencrypt/live/haikari.top/fullchain.pem /data/nginx/ssl/haikari.top.crt
cp /etc/letsencrypt/live/haikari.top/privkey.pem /data/nginx/ssl/haikari.top.key

# 如果使用方案二，再复制其他副本
cp /etc/letsencrypt/live/haikari.top/fullchain.pem /data/nginx/ssl/haikari.top.crt
cp /etc/letsencrypt/live/haikari.top/privkey.pem /data/nginx/ssl/haikari.top.key

cp /etc/letsencrypt/live/haikari.top/fullchain.pem /data/nginx/ssl/sherry.haikari.top.crt
cp /etc/letsencrypt/live/haikari.top/privkey.pem /data/nginx/ssl/sherry.haikari.top.key

cp /etc/letsencrypt/live/haikari.top/fullchain.pem /data/nginx/ssl/blog.admin.haikari.top.crt
cp /etc/letsencrypt/live/haikari.top/privkey.pem /data/nginx/ssl/blog.admin.haikari.top.key

cp /etc/letsencrypt/live/haikari.top/fullchain.pem /data/nginx/ssl/minio.haikari.top.crt
cp /etc/letsencrypt/live/haikari.top/privkey.pem /data/nginx/ssl/minio.haikari.top.key


# 重启nginx
docker restart nginx
EOF

# 赋予执行权限
chmod +x /root/renew-ssl.sh

# 添加定时任务（每月1号凌晨执行）
(crontab -l 2>/dev/null; echo "0 0 1 * * /root/renew-ssl.sh >> /var/log/ssl-renew.log 2>&1") | crontab -


# 检查证书文件
ls -lh /data/nginx/ssl/

# 检查证书有效期
openssl x509 -in /data/nginx/ssl/haikari.top.crt -noout -dates
```



### rabbitMq的docker部署命令

```bash
docker run -d \
  --name rabbitmq \
  -e RABBITMQ_DEFAULT_USER=haibara \
  -e RABBITMQ_DEFAULT_PASS=Ww249260523.. \
  -p 5672:5672 \
  -p 15672:15672 \
  -v /data/rabbitmq/data:/var/lib/rabbitmq \
  rabbitmq:3-management
```



### 前端部署

```bash
pnpm install

pnpm run build

scp -r dist/* root@154.94.235.178:/data/nginx/html/blog

```



### 后端dockerfile

```dockerfile
FROM eclipse-temurin:17-jre

LABEL maintainer="Haibara <Haibara406@gmail.com>"
LABEL description="Haibara Blog Backend Service"

ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

# 只复制已经构建好的jar包
COPY target/*.jar app.jar

EXPOSE 8062

ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8062/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```



### 后端部署

```bash
# 1. 在本地先用Maven构建jar包
cd /Users/haibara/Documents/java_program/haibara-blog-backend/blog-backend
mvn clean package -DskipTests

# 2. 构建Docker镜像（使用简化的Dockerfile）
docker build -t haibara-blog-backend:latest .

# 3. 保存镜像
docker save -o haibara-blog-backend.tar haibara-blog-backend:latest

# 4. 上传到服务器
scp haibara-blog-backend.tar root@154.94.235.178:/root/

# 5. 在服务器上加载并运行
# ssh root@154.94.235.178
docker load -i /root/haibara-blog-backend.tar
docker run -d \
  --name haibara-blog-backend \
  -p 8066:8066 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -v /app/logs:/app/logs \
  --restart unless-stopped \
  --log-opt max-size=100m \
  --log-opt max-file=5 \
  haibara-blog-backend:latest
```





