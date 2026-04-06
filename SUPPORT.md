# Support

Need help with EvalAI Pro? Here are the resources available to you.

## Table of Contents

1. [Documentation](#documentation)
2. [FAQ](#faq)
3. [Getting Help](#getting-help)
4. [Reporting Issues](#reporting-issues)
5. [Community Support](#community-support)
6. [Professional Support](#professional-support)

## Documentation

### Official Documentation

- **[README.md](README.md)** - Project overview and quick start
- **[INSTALLATION.md](INSTALLATION.md)** - Detailed setup instructions
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design and architecture
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Development workflow
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deployment strategies
- **[docs/TESTING.md](docs/TESTING.md)** - Testing guide
- **[API Documentation](http://localhost:8000/docs)** - Interactive API docs

### Quick Links

- **Setup Guides**: [INSTALLATION.md](INSTALLATION.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Code of Conduct**: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- **Security**: [SECURITY.md](SECURITY.md)

## FAQ

### General Questions

**Q: What is EvalAI Pro?**
A: EvalAI Pro is an AI-powered answer sheet evaluation system that uses OCR and LLMs to automatically grade student submissions.

**Q: What are the system requirements?**
A: See [INSTALLATION.md - System Requirements](INSTALLATION.md#system-requirements)

**Q: Can I run EvalAI Pro locally?**
A: Yes, see [INSTALLATION.md - Local Development Setup](INSTALLATION.md#local-development-setup)

**Q: Do I need to pay for this?**
A: No, EvalAI Pro is free, open-source software under the MIT License.

### Installation & Setup

**Q: How do I install EvalAI Pro?**
A: Follow the [INSTALLATION.md](INSTALLATION.md) guide for step-by-step instructions.

**Q: What's the easiest way to run EvalAI Pro?**
A: Use Docker Compose: `docker-compose up -d`

**Q: Can I run EvalAI Pro on Windows?**
A: Yes, use Windows Subsystem for Linux (WSL2) or Docker Desktop.

**Q: How do I set environment variables?**
A: Create a `.env` file in the backend directory with your configuration.

### Configuration

**Q: Where do I set my OpenAI API key?**
A: Set `OPENAI_API_KEY` in your `.env` file or environment variables.

**Q: Can I use other AI providers besides OpenAI?**
A: Yes, EvalAI Pro supports Google AI, Anthropic, and other providers.

**Q: How do I connect to my database?**
A: Set `DATABASE_URL` environment variable with your database connection string.

### Usage

**Q: How do I upload answer sheets?**
A: Use the Upload page in the application to select and process documents.

**Q: How are students graded?**
A: Students are graded based on rubrics and AI evaluation of their answers.

**Q: Can I customize grading rubrics?**
A: Yes, create and customize rubrics in the Rubrics section.

**Q: How do I view student feedback?**
A: Navigate to Results/Feedback section to see detailed feedback for each student.

### Technical Issues

**Q: Port 3000/8000 is already in use. What do I do?**
A: Stop the service using that port or use a different port:
```bash
npm run dev -- -p 3001
```

**Q: I'm getting "module not found" errors.**
A: Reinstall dependencies:
```bash
npm install
# or
pip install -r requirements.txt
```

**Q: Database connection fails.**
A: Verify your database is running and `DATABASE_URL` is correct.

**Q: Tests are failing. What should I do?**
A: Run `bash scripts/run-tests.sh` for comprehensive testing and check logs.

### Troubleshooting

**Q: Application is slow. How do I improve performance?**
A: Check [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#performance-optimization)

**Q: How do I enable debug mode?**
A: Set `DEBUG=true` and `LOG_LEVEL=DEBUG` in environment variables.

**Q: Where are error logs stored?**
A: Logs are printed to console. Use Docker Compose logs: `docker-compose logs`

## Getting Help

### Online Resources

1. **Documentation**: Check [docs/](docs/) directory
2. **API Documentation**: Visit http://localhost:8000/docs
3. **Code Examples**: Check `app/` directory for examples
4. **Configuration Examples**: See `docker-compose.yml`

### Discussion & Q&A

- **GitHub Discussions**: [evalai-pro/discussions](https://github.com/your-repo/evalai-pro/discussions)
  - Ask questions and share ideas
  - Community members help answer questions
  - Good for general inquiries

### Report Issues

- **Bug Reports**: [GitHub Issues](https://github.com/your-repo/evalai-pro/issues)
  - Use bug report template
  - Include reproduction steps
  - Attach relevant logs or screenshots

- **Feature Requests**: [GitHub Issues](https://github.com/your-repo/evalai-pro/issues)
  - Use feature request template
  - Explain the use case
  - Provide context

## Reporting Issues

### Before Reporting

1. Check [existing issues](https://github.com/your-repo/evalai-pro/issues) - someone may have reported it
2. Check [FAQ](#faq) - your question might be answered
3. Check [docs/](docs/) - solution might be in documentation
4. Try updating to latest version - issue might be fixed

### How to Report

1. **Click "New Issue"** on GitHub
2. **Choose template**:
   - Bug Report - for bugs
   - Feature Request - for new features
3. **Fill out template completely**:
   - Be specific and clear
   - Include steps to reproduce
   - Provide error messages
   - Mention your environment
4. **Include details**:
   - Operating system
   - Node.js/Python versions
   - EvalAI Pro version
   - Relevant code snippets

### Good Issue Examples

✅ **Good**: "Login fails with JWT validation error on Firefox 120"
❌ **Bad**: "App doesn't work"

✅ **Good**: Steps provided + error message + environment details
❌ **Bad**: No context or details

## Community Support

### Forums & Discussions

- **GitHub Discussions**: Ask questions, share ideas, get help
- **GitHub Issues**: Report bugs and request features

### Contributing

Helping other users is a great contribution! Check [CONTRIBUTING.md](CONTRIBUTING.md).

### Community Events

- Webinars and workshops (announced in Discussions)
- Community meetups
- Office hours (when scheduled)

## Professional Support

### When to Contact Support

Professional support is available for:
- Enterprise deployments
- Custom integrations
- Performance optimization
- Training and onboarding

### How to Get Professional Support

1. **Email**: [support@evalai-pro.com](mailto:support@evalai-pro.com)
2. **GitHub Issues**: Mark as "enterprise-support"
3. **Contact Form**: [www.evalai-pro.com/support](https://www.evalai-pro.com/support)

### Response Times

- **Critical (Down)**: 1 hour
- **High (Major Issue)**: 4 hours
- **Medium**: 24 hours
- **Low**: 48 hours

### What's Included

Professional support typically includes:
- Direct access to development team
- Priority bug fixes
- Custom deployments
- Training and documentation
- Performance tuning
- Integration assistance

## Security Support

### Reporting Security Issues

**⚠️ DO NOT open public issues for security vulnerabilities**

See [SECURITY.md](SECURITY.md) for responsible disclosure.

## Additional Resources

### Books & Tutorials

- FastAPI Official Docs
- Next.js Official Docs
- PostgreSQL Documentation
- Kubernetes Official Docs

### Useful Links

- [GitHub Repository](https://github.com/your-repo/evalai-pro)
- [Official Website](https://www.evalai-pro.com)
- [Blog](https://blog.evalai-pro.com)
- [Status Page](https://status.evalai-pro.com)

### Learning Paths

1. **Getting Started**: INSTALLATION.md → README.md
2. **Development**: docs/DEVELOPMENT.md → CONTRIBUTING.md
3. **Deployment**: docs/DEPLOYMENT.md → Kubernetes docs
4. **Advanced**: docs/ARCHITECTURE.md → Source code

## Feedback

We'd love to hear from you!

- **Ideas**: Share suggestions in [GitHub Discussions](https://github.com/your-repo/evalai-pro/discussions)
- **Feedback**: Let us know what's working and what isn't
- **Improvements**: Contribute enhancements through PRs

## Community

Join our community:

- 🌐 [Website](https://www.evalai-pro.com)
- 💬 [Discord Server](https://discord.gg/evalai)
- 🐦 [Twitter](https://twitter.com/evalai_pro)
- 📧 [Newsletter](https://newsletter.evalai-pro.com)

---

**Still need help?** Open an issue or reach out on [GitHub Discussions](https://github.com/your-repo/evalai-pro/discussions)!

**Last updated**: 2024
