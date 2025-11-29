# Contributing to EvalAI Pro

Thank you for your interest in contributing to EvalAI Pro! This document provides guidelines and instructions for participating in our project. We value contributions from the community and appreciate your help in making this project better.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). We are committed to providing a welcoming and inclusive environment for all contributors.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [Making Changes](#making-changes)
4. [Commit Guidelines](#commit-guidelines)
5. [Testing](#testing)
6. [Pull Requests](#pull-requests)
7. [Code Style](#code-style)
8. [Documentation](#documentation)
9. [Security](#security)
10. [Release Process](#release-process)

## Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **Python**: Version 3.10 or higher
- **Git**: For version control
- **Docker** (optional): For full-stack testing
- **pnpm** (recommended): For faster package management

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/evalai-pro.git
   cd evalai-pro
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/original-repo/evalai-pro.git
   ```

## Development Setup

### Frontend Development

```bash
# Install dependencies
npm install
# or with pnpm
pnpm install

# Start development server
npm run dev

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm test
```

Frontend will be available at `http://localhost:3000`

### Backend Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
pip install -r backend/requirements-dev.txt  # For testing tools

# Set environment variables
export OPENAI_API_KEY=your_key_here
export JWT_SECRET=dev_secret_key
export DATABASE_URL=postgresql://postgres:password@localhost:5432/evalai_dev

# Start development server
python backend/main.py

# Run tests
pytest backend/testing

# Security scanning
bandit -r backend
```

Backend API will be available at `http://localhost:8000` with docs at `http://localhost:8000/docs`

### Full Stack with Docker Compose

```bash
docker-compose up -d
```

All services will start automatically:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432
- MongoDB: localhost:27017
- Redis: localhost:6379

## Making Changes

### Create a Feature Branch

```bash
# Keep main clean
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/issue-description
```

### Branch Naming Conventions

- `feature/description`: New features
- `fix/description`: Bug fixes
- `docs/description`: Documentation updates
- `refactor/description`: Code refactoring
- `test/description`: Test additions or improvements
- `chore/description`: Maintenance tasks

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear commit history:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, missing semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to build process, dependencies, etc.

### Examples

```bash
# Good feature commit
git commit -m "feat(ocr): add support for handwritten character recognition"

# Good bug fix
git commit -m "fix(auth): resolve jwt token expiration validation

Previously, tokens were not properly validated on expiration.
This implements proper expiration checking."

# Good documentation update
git commit -m "docs(readme): add docker compose quick start section"
```

## Testing

### Frontend Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.spec.ts

# E2E tests
npm run cypress:open
```

### Backend Testing

```bash
# Run all tests
pytest backend/testing

# Run with coverage
pytest backend/testing --cov=backend --cov-report=html

# Run specific test
pytest backend/testing/test_api_endpoints.py::test_specific_function

# Verbose output
pytest backend/testing -v
```

### Before Pushing

Always run tests locally before pushing:

```bash
# Frontend
npm test
npm run lint
npm run build

# Backend
pytest backend/testing
bandit -r backend
```

## Pull Requests

### Creating a Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a PR on GitHub** with a clear title and description

3. **Link related issues** using GitHub's linking syntax:
   ```
   Closes #123
   Related to #456
   ```

### PR Guidelines

- **Title**: Clear and descriptive (use conventional commit format)
- **Description**: Include:
  - What changes were made
  - Why these changes were necessary
  - How to test the changes
  - Any breaking changes
  - Screenshots for UI changes
  - Related issue links

### PR Template Example

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add before/after screenshots for UI changes.

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tested on multiple browsers/devices
- [ ] No sensitive information committed
```

### Review Process

1. At least one maintainer review is required
2. All CI checks must pass
3. Conversations should remain professional and constructive
4. Changes may be requested before merging

## Code Style

### Frontend (TypeScript/React)

```typescript
// Use arrow functions for components
export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>;
};

// Use meaningful variable names
const isUserAuthenticated = Boolean(user?.token);

// Use const by default, let if needed, avoid var
const MAX_RETRIES = 3;

// Always use TypeScript types
interface UserData {
  id: string;
  email: string;
  role: "admin" | "teacher" | "student";
}

// Use async/await
async function fetchUser(id: string): Promise<UserData> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

### Backend (Python)

```python
# Follow PEP 8 standards
from typing import Optional, List
from pydantic import BaseModel, Field

# Use type hints
class UserCreate(BaseModel):
    email: str = Field(..., description="User email")
    username: str
    password: str = Field(..., min_length=8)

def get_user_by_id(user_id: int) -> Optional[User]:
    """Get a user by their ID."""
    return db.query(User).filter(User.id == user_id).first()

# Use meaningful names
is_authenticated = bool(user and user.is_active)
max_pagination_limit = 100
```

### General Guidelines

- Use 2-space indentation for TypeScript/JavaScript
- Use 4-space indentation for Python
- Keep line lengths under 100 characters
- Use descriptive variable and function names
- Add comments only for complex logic
- Use linters and formatters:
  - Frontend: ESLint, Prettier
  - Backend: black, flake8, isort

## Documentation

### When to Document

- New features
- API endpoints
- Complex algorithms
- Configuration options
- Breaking changes

### Documentation Format

- **Inline comments**: Explain "why", not "what"
- **JSDoc/docstrings**: For public APIs
- **README**: High-level overview
- **docs/ files**: Detailed guides

### Example

```typescript
/**
 * Validates an email address against RFC 5322 standards.
 *
 * @param email - The email address to validate
 * @returns true if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

## Security

### Security Considerations

1. **Never commit secrets**:
   - Use environment variables
   - Use `.env.local` (never commit)
   - Use secret managers in production

2. **Input validation**:
   - Validate all user inputs
   - Sanitize output
   - Use TypeScript types

3. **Authentication & Authorization**:
   - Implement proper JWT validation
   - Verify user permissions
   - Use HTTPS in production

4. **Dependencies**:
   - Keep dependencies updated
   - Run security audits regularly
   - Review dependency licenses

5. **Data Protection**:
   - Encrypt sensitive data
   - Implement proper access controls
   - Follow GDPR/privacy guidelines

### Reporting Security Issues

Please see [SECURITY.md](SECURITY.md) for vulnerability disclosure guidelines. **Do not open public issues for security vulnerabilities.**

## Release Process

### Version Numbers

We follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- `1.2.3` where 1=major, 2=minor, 3=patch

### Creating a Release

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.2.3`
4. Push tag: `git push origin v1.2.3`
5. Create GitHub Release with changelog

## Getting Help

- **Issues**: Check existing issues or open a new one
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check `/docs` directory
- **Community**: Reach out on social media or community forums

## Recognition

Contributors will be recognized in:
- [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Release notes
- Project README

Thank you for contributing to EvalAI Pro! 🎉
