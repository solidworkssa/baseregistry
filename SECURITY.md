# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please send an email to the project maintainers with:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Communication**: We will keep you informed about the progress of fixing the vulnerability
- **Timeline**: We aim to patch critical vulnerabilities within 7 days
- **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

### Smart Contract Security

1. **Access Control**: All admin functions are protected with `onlyOwner` modifier
2. **Reentrancy Protection**: Critical functions use `nonReentrant` modifier
3. **Pause Mechanism**: Emergency pause functionality for critical situations
4. **Input Validation**: All user inputs are validated for length and format
5. **Integer Overflow**: Using Solidity 0.8.x with built-in overflow protection

### Frontend Security

1. **Environment Variables**: Never commit `.env` files
2. **Private Keys**: Never expose private keys in frontend code
3. **Input Sanitization**: All user inputs are sanitized
4. **HTTPS Only**: Always use HTTPS in production
5. **Dependency Updates**: Regularly update dependencies

### Deployment Security

1. **Testnet First**: Always deploy to testnet before mainnet
2. **Verification**: Verify all contracts on block explorers
3. **Multi-sig**: Consider using multi-sig wallets for contract ownership
4. **Audit**: Consider professional security audit before mainnet deployment

## Known Security Considerations

### Smart Contract

- **String Storage**: Storing strings on-chain is expensive and has size limits (MAX_NAME_LENGTH: 32, MAX_DATA_LENGTH: 256)
- **Name Squatting**: First-come-first-served registration model may enable name squatting
- **Fee Changes**: Owner can change registration fees (consider governance for production)

### Frontend

- **Wallet Connection**: Users must trust wallet providers
- **RPC Endpoints**: Users should use trusted RPC endpoints
- **Transaction Signing**: Always verify transaction details before signing

## Security Checklist for Contributors

Before submitting code:

- [ ] No hardcoded private keys or sensitive data
- [ ] All user inputs are validated
- [ ] Access control is properly implemented
- [ ] Tests cover security-critical functionality
- [ ] Dependencies are up to date
- [ ] No known vulnerabilities in dependencies (`npm audit`)

## Bug Bounty Program

We currently do not have a bug bounty program, but we greatly appreciate responsible disclosure of security vulnerabilities.

## Audit Status

**Current Status**: Not audited

This project has not undergone a professional security audit. Use at your own risk, especially on mainnet.

## Security Updates

Security updates will be announced through:
- GitHub Security Advisories
- Release notes
- Project README

## Additional Resources

- [Ethereum Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/4.x/security)
- [Solidity Security Considerations](https://docs.soliditylang.org/en/latest/security-considerations.html)

## Contact

For security concerns, please contact the project maintainers directly rather than using public channels.
