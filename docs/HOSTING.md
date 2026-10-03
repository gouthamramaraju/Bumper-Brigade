# Let friends play from different homes

Deploy the whole Node project to a host that supports a long-running Node process and WebSockets. A static-only website host cannot run this multiplayer server.

Use `npm ci --omit=dev` to install server dependencies and `npm start` to run it. Set `PORT` if required by your host. Use HTTPS with WebSocket upgrades enabled. Keep one process/replica initially: rooms live in memory and disappear on restart. Multiple replicas need shared room storage or reliable routing, which this starter does not implement.

For phone apps on another server, generate with:

```sh
ARCADE_SERVER_URL=https://your-server.example APP_ID=com.yourname.bumperbrigade npm run build:mobile -- --native
```

Set server `ALLOWED_ORIGINS` to `capacitor://localhost,https://localhost` for these native clients. Browser clients on the server's own address are accepted automatically. Do not use wildcards unnecessarily. HTTPS is required for service-worker offline caching; solo works offline after an initial secure load. Online rooms always need a live server.

The Dockerfile is included. Hosting price depends on the provider and traffic; no hosting account or paid plan has been purchased or deployed. Before public launch, inspect host logs, configure resource limits and exercise ten simultaneous clients through the actual HTTPS endpoint.
