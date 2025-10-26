# HTTP Honeypot (low-interaction)

A low-interaction HTTP honeypot that simulates common admin/login pages, records attacker requests, and provides a simple (token-protected) dashboard to review captured events.

WARNING / Legal & safety
- Only deploy this on infrastructure you own or control.
- Do not intercept or forward real user traffic.
- Avoid capturing sensitive personal data. The honeypot stores anything attackers send — treat the data as potentially sensitive.
- Run in an isolated environment (VPC/subnet), block outbound network access if not required, and monitor resource usage.
- This project is for research, testing, and defensive use only.

Features
- Fake endpoints that commonly attract scanners: /admin, /login, /wp-admin, /phpmyadmin
- Captures: timestamp, source IP, path, method, headers, query, and POST body
- Simple SQLite storage (data/honeypot.db)
- Minimal dashboard at /dashboard?token=YOUR_TOKEN to review captured attempts
- Dockerfile + docker-compose for quick deployment

Quick start (local)
1. Install
   npm install

2. Start
   npm start

3. Access
   - Honeypot listens on port 3000 by default.
   - Dashboard: http://localhost:3000/dashboard?token=REPLACE_WITH_TOKEN

Quick start (docker)
1. Build & run
   docker-compose up --build

Configuration
- Set HONEYPOT_TOKEN environment variable to a random token to protect the dashboard.
- The default DB is stored at ./data/honeypot.db (mounted in docker-compose).

Extending
- Add more fake endpoints or content to increase engagement.
- Add automated alerting (email, webhook, Slack) on high-severity events.
- Integrate with SIEM or ELK for analysis.

License
MIT
