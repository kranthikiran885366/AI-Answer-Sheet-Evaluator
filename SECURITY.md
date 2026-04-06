# Security Policy

## Supported Versions
The main branch is actively supported. For released tags, support varies.

## Reporting a Vulnerability
- Do not open public issue with sensitive details
- Instead, open a private security report (confidential issue) describing the impact and steps to reproduce
- We will acknowledge within 72 hours and provide a timeline for remediation when possible

## Handling Secrets
- Use environment variables or secret managers (Kubernetes Secrets, CI secrets, etc.)
- Never commit keys or tokens to the repository
