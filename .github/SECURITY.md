# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in EvalAI Pro, please report it responsibly.

**⚠️ DO NOT open a public GitHub issue for security vulnerabilities.**

Instead, please:

1. **Email Security Team**: Send details to [security@evalai.pro](mailto:security@evalai.pro)
2. **Include Details**:
   - Type of vulnerability
   - Location in the code (if known)
   - Potential impact
   - Suggested fix (if you have one)
3. **Allow Time**: Give us reasonable time (typically 30 days) to address the issue before public disclosure

## Security Response Timeline

- **Initial Response**: Within 48 hours
- **Assessment**: Within 1 week
- **Fix & Security Update**: As soon as possible
- **Disclosure**: After fix is released

## Supported Versions

We provide security updates for:

- **Current version**: Full support
- **Previous version**: Limited support (critical fixes only)
- **Older versions**: Community support via issues/PRs

## Security Best Practices

### For Users

1. **Keep Dependencies Updated**: Regularly run `npm audit` and `pip install --upgrade`
2. **Use Environment Variables**: Never hardcode secrets
3. **Secure Endpoints**: Use HTTPS in production
4. **Limit Permissions**: Follow principle of least privilege
5. **Monitoring**: Set up error tracking (Sentry) in production
6. **Backups**: Maintain regular database backups

### For Contributors

1. **Code Review**: All changes are reviewed before merging
2. **Automated Scanning**:
   - Frontend: npm audit, Snyk
   - Backend: bandit, safety checks
3. **SAST Tools**: GitHub CodeQL and Trivy
4. **Dependency Scanning**: Dependabot alerts
5. **Type Safety**: Use TypeScript and Python type hints
6. **Input Validation**: Always validate user input
7. **Secrets Management**: Use environment variables, never commit secrets

## Common Vulnerabilities & Mitigation

### SQL Injection
- ✅ Use ORM (SQLAlchemy) with parameterized queries
- ✅ Never concatenate SQL strings
- ❌ Avoid raw SQL queries

### XSS (Cross-Site Scripting)
- ✅ Use React's built-in escaping
- ✅ Sanitize user input with DOMPurify if needed
- ✅ Use Content Security Policy (CSP) headers
- ❌ Never use `dangerouslySetInnerHTML`

### CSRF (Cross-Site Request Forgery)
- ✅ Use CSRF tokens for state-changing operations
- ✅ Validate origin headers
- ✅ Use SameSite cookies
- ❌ Don't rely on origin header alone

### Authentication & Authorization
- ✅ Use JWT with proper expiration
- ✅ Hash passwords with bcrypt or argon2
- ✅ Implement rate limiting
- ✅ Verify permissions on every endpoint
- ❌ Don't trust client-side authentication checks

### Dependency Vulnerabilities
- ✅ Keep dependencies updated
- ✅ Review dependency licenses
- ✅ Use lock files (package-lock.json, requirements.txt)
- ✅ Monitor with Dependabot
- ❌ Don't use packages with known vulnerabilities

## Security Configuration

### Frontend (.env)
```bash
# Only public variables (no secrets)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_WS_URL=wss://api.example.com
```

### Backend (.env - never commit)
```bash
# Secrets (use environment variables)
JWT_SECRET=long_random_string
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
```

### Production Hardening
- Enable HTTPS/TLS everywhere
- Use security headers:
  - Content-Security-Policy
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security
  - X-XSS-Protection
- Enable CORS only for trusted origins
- Implement rate limiting
- Use Web Application Firewall (WAF)
- Enable logging and monitoring
- Regular security audits

## Compliance & Standards

- **OWASP Top 10**: We follow OWASP security guidelines
- **Security Headers**: Implemented via reverse proxy
- **Dependency Management**: Regular audits and updates
- **Code Review**: All code reviewed by maintainers
- **Testing**: Security testing in CI/CD pipeline

## Version History

| Version | Release Date | Security Updates |
|---------|-------------|------------------|
| 1.0.0 | 2024-01-01 | Initial release |
| 1.0.1 | 2024-01-15 | Critical security patch |
| 1.1.0 | 2024-02-01 | Security improvements |

## External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Python Security](https://python.readthedocs.io/en/latest/library/security_warnings.html)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [GitHub Security Lab](https://securitylab.github.com/)

## Acknowledgments

We appreciate security researchers who responsibly report vulnerabilities. Significant security contributions will be acknowledged in release notes.

---

**Last Updated**: 2024  
**Questions?** Contact [security@evalai.pro](mailto:security@evalai.pro)
