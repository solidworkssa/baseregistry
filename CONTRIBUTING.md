# Contributing to BaseRegistry

Thank you for your interest in contributing to BaseRegistry! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots if applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please create an issue with:
- A clear description of the proposed feature
- Use cases and benefits
- Any potential implementation details

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** following our coding standards
4. **Add tests** for any new functionality
5. **Run tests**: `npm test`
6. **Run linter**: `npm run lint`
7. **Commit your changes** with clear, descriptive messages
8. **Push to your fork** and submit a pull request

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/baseregistry.git
cd baseregistry

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Smart Contract Development

```bash
# Compile contracts
npx hardhat compile

# Run contract tests
npx hardhat test

# Deploy to local network
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy.ts --network baseSepolia
```

### Frontend Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Solidity

- Follow Solidity style guide
- Use NatSpec comments for all public functions
- Implement comprehensive tests
- Consider gas optimization
- Follow security best practices

### Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests when relevant

Example:
```
Add transfer functionality to BaseRegistry

- Implement transfer function in contract
- Add transfer tests
- Update documentation

Fixes #123
```

## Testing Guidelines

### Smart Contracts

- Aim for 100% code coverage
- Test all edge cases
- Test access control
- Test event emissions
- Include gas optimization tests

### Frontend

- Write unit tests for components
- Write integration tests for features
- Test error states
- Test loading states
- Ensure accessibility

## Security

- Never commit private keys or sensitive data
- Report security vulnerabilities privately (see SECURITY.md)
- Follow smart contract security best practices
- Use OpenZeppelin contracts when possible

## Documentation

- Update README.md for user-facing changes
- Update code comments for implementation changes
- Add JSDoc/NatSpec for new functions
- Update CHANGELOG.md

## Review Process

1. All submissions require review
2. Maintainers will review your PR
3. Address any requested changes
4. Once approved, maintainers will merge

## Questions?

Feel free to open an issue for any questions or clarifications needed.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).
