---
title: Reverse proxy and TLS
description: Get automatic HTTPS from the container, or put your own reverse proxy with TLS in front of Feedback Pilgrim.
order: 1
---

# Reverse proxy and TLS

The container gets its own TLS certificates by default. You need your own proxy only if another web server already uses ports 80 and 443, or if Cloudflare or a load balancer is in front of the server.

## DNS

Make two DNS records that point to your server:

| Record | Example | What it serves |
|---|---|---|
| The dashboard domain | `feedback.example.com` | The dashboard, the REST API, the MCP server and `pilgrim.js` |
| A wildcard for the projects | `*.feedback.example.com` | The public site of each project |

## Automatic HTTPS

When `APP_DOMAIN` is set, Caddy in the container serves ports 80 and 443. Publish both ports:

```bash
docker run -d --name feedbackpilgrim --restart unless-stopped \
  -p 80:80 -p 443:443 -p 443:443/udp \
  -e APP_DOMAIN=feedback.example.com \
  -v feedbackpilgrim:/data \
  ghcr.io/amedina068/feedbackpilgrim
```

Caddy uses on-demand TLS. It gets a certificate from Let's Encrypt for each host on the first visit. Before it asks for a certificate, Caddy asks the app if the host is the dashboard domain or the subdomain of a project. Caddy gets no certificate for other hosts.

- You need no wildcard certificate and no DNS API key.
- The certificates stay in the `/data` volume.
- Port 80 must be open. Let's Encrypt checks the host on port 80, and Caddy redirects HTTP to HTTPS.
- The first visit to a new project subdomain takes one or two seconds more while Caddy gets the certificate.
- To get notices from Let's Encrypt about the certificates, set `ACME_EMAIL`.

## Your own proxy

To use your own proxy, set `CADDY_ENABLED=false` and publish only port 8080 of the container:

```bash
docker run -d --name feedbackpilgrim --restart unless-stopped \
  -p 127.0.0.1:8080:8080 \
  -e APP_DOMAIN=feedback.example.com \
  -e CADDY_ENABLED=false \
  -e TRUSTED_PROXIES=172.16.0.0/12 \
  -v feedbackpilgrim:/data \
  ghcr.io/amedina068/feedbackpilgrim
```

Port 8080 serves plain HTTP. The proxy must serve HTTPS, with a certificate that covers the dashboard domain and the wildcard. Most ACME clients need a DNS challenge for a wildcard certificate.

## Send the traffic to the app

Send both names to port 8080 of the container. Keep the original `Host` header, because the app finds the project from the host.

The [`deploy/`](https://github.com/amedina068/feedbackpilgrim/tree/main/deploy) folder of the app repository has an NGINX example for this proxy: [`nginx/feedbackpilgrim-proxy.conf`](https://github.com/amedina068/feedbackpilgrim/blob/main/deploy/nginx/feedbackpilgrim-proxy.conf).

This example `Caddyfile` gets a wildcard certificate with a DNS challenge. It needs a Caddy build with the module of your DNS provider, here Cloudflare:

```text
feedback.example.com, *.feedback.example.com {
    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }
    reverse_proxy 127.0.0.1:8080
}
```

## Forwarded headers

The app reads these headers only from a trusted proxy: `X-Forwarded-For`, `X-Forwarded-Host`, `X-Forwarded-Port`, `X-Forwarded-Proto` and the AWS ELB header. The rate limits and the logs use the client IP from these headers.

`TRUSTED_PROXIES` in `.env` sets the trusted proxies. It is a comma-separated list of IP addresses or CIDR ranges. If it is empty, the app trusts only the Cloudflare ranges in `config/trustedproxy.php`. Use the address that the app sees, not the public address of the proxy:

- If Caddy or NGINX runs on the Docker host, use the Docker network range: `TRUSTED_PROXIES=172.16.0.0/12`.
- If the proxy is on another server, use the private address of that server.
- If NGINX or Caddy runs PHP-FPM directly, without Docker, leave the value empty.

If the value is wrong, the app sees all the visitors with the IP of the proxy. Then the rate limits apply to all the visitors together, and the links in the emails can use `http` instead of `https`.

WARNING: Do not set `TRUSTED_PROXIES=*` when the app port is open to the internet. A client that can reach the port directly can then send a false IP, host or scheme.

The example above publishes the port on the loopback interface (`127.0.0.1`) of the host. Thus only a proxy on the same host can reach the port. The Compose files do the same. If the proxy is on another host, publish the port on all interfaces (with Compose, set `APP_BIND=0.0.0.0` in `.env`). Then allow the port only from the proxy with a firewall rule.

## Domain values

With `APP_DOMAIN` set, the app derives the other domain values. It uses `https` when `APP_URL` is not set. You need the table below only for an install without Docker, or to change a derived value:

| Variable | Value |
|---|---|
| `APP_URL` | `https://feedback.example.com` |
| `APP_DOMAIN` | `feedback.example.com` |
| `SESSION_DOMAIN` | `.feedback.example.com` |
| `SESSION_SECURE_COOKIE` | `true` |
| `SANCTUM_STATEFUL_DOMAINS` | `feedback.example.com,*.feedback.example.com` |

The scheme of `APP_URL` is also the scheme of the links to the public sites. Read [Configuration](../getting-started/configuration.md#domains).

## Health check

The route `/up` answers on any host. Use it for the health check of your proxy or your load balancer:

```bash
curl -fsS https://feedback.example.com/up
```
