# BaseRegistry

A decentralized registry system built on Base L2, enabling users to register unique names and associate data with them on-chain. Features a modern Next.js frontend with a secure Solidity smart contract backend.

## Features

- **Unique Name Registration**: Register and claim unique names on the Base blockchain
- **Data Association**: Store and update data associated with your registered names
- **Ownership Transfer**: Transfer name ownership to other addresses
- **Access Control**: Secure admin functions with OpenZeppelin's Ownable pattern
- **Emergency Pause**: Contract can be paused in case of emergencies
- **Fee Management**: Configurable registration fees
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **Type Safety**: Full TypeScript support for both frontend and smart contracts

## Architecture

### Smart Contract

- **Network**: Base (Mainnet) / Base Sepolia (Testnet)
- **Solidity Version**: 0.8.19
- **Security**: OpenZeppelin contracts (Ownable, ReentrancyGuard, Pausable)
- **Features**: Registration, updates, transfers, admin controls

### Frontend

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: React hooks
- **Web3**: Ready for wagmi/viem integration

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- MetaMask or compatible Web3 wallet
- Base Sepolia ETH for testnet (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/baseregistry.git
cd baseregistry
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Required for deployment
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key_here

# Required for frontend
NEXT_PUBLIC_CONTRACT_ADDRESS=deployed_contract_address
NEXT_PUBLIC_CHAIN_ID=84532
```

## Smart Contract Development

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with gas reporting
REPORT_GAS=true npm test
```

### Deploy Contract

#### Local Network

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy
npm run deploy:local
```

#### Base Sepolia Testnet

```bash
npm run deploy:sepolia
```

#### Base Mainnet

```bash
npm run deploy:mainnet
```

### Verify Contract

After deployment, verify on Basescan:

```bash
npx hardhat verify --network baseSepolia DEPLOYED_CONTRACT_ADDRESS "1000000000000000"
```

## Frontend Development

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
baseregistry/
├── contracts/              # Solidity smart contracts
│   └── BaseRegistry.sol
├── scripts/               # Deployment scripts
│   └── deploy.ts
├── test/                  # Smart contract tests
│   └── BaseRegistry.test.ts
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   └── lib/             # Utility functions
├── public/              # Static assets
├── hardhat.config.ts    # Hardhat configuration
├── tsconfig.json        # TypeScript configuration
├── .env.example         # Environment variables template
└── package.json
```

## Smart Contract API

### Read Functions

#### `getRecord(string name)`
Get details of a registered name.

**Returns:**
- `owner`: Address of the owner
- `data`: Associated data
- `createdAt`: Registration timestamp
- `updatedAt`: Last update timestamp

#### `isAvailable(string name)`
Check if a name is available for registration.

**Returns:** `bool` - True if available

#### `getOwnedNames(address owner)`
Get all names owned by an address.

**Returns:** `string[]` - Array of owned names

#### `registrationFee()`
Get the current registration fee.

**Returns:** `uint256` - Fee in wei

### Write Functions

#### `register(string name, string data)`
Register a new name (requires fee payment).

**Parameters:**
- `name`: Unique name to register (max 32 chars)
- `data`: Associated data (max 256 chars)

#### `update(string name, string data)`
Update data for owned name.

**Parameters:**
- `name`: Name to update
- `data`: New data

#### `transfer(string name, address newOwner)`
Transfer name ownership.

**Parameters:**
- `name`: Name to transfer
- `newOwner`: New owner address

### Admin Functions (Owner Only)

#### `setRegistrationFee(uint256 newFee)`
Update registration fee.

#### `pause()` / `unpause()`
Emergency pause/unpause contract.

#### `withdraw(address payable to)`
Withdraw accumulated fees.

## Testing

The project includes comprehensive test coverage:

- ✅ Deployment tests
- ✅ Registration functionality
- ✅ Update operations
- ✅ Transfer mechanism
- ✅ Access control
- ✅ Pause functionality
- ✅ Fee management
- ✅ Gas optimization
- ✅ Edge cases

Run tests with:

```bash
npm test
```

## Security

### Audit Status

⚠️ **This contract has not been professionally audited.** Use at your own risk, especially on mainnet.

### Security Features

- OpenZeppelin battle-tested contracts
- Reentrancy protection
- Access control with Ownable
- Emergency pause mechanism
- Input validation and length limits
- Overflow protection (Solidity 0.8.x)

### Reporting Vulnerabilities

Please see [SECURITY.md](SECURITY.md) for our security policy and how to report vulnerabilities.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Roadmap

### Phase 1 (Current)
- ✅ Basic registry functionality
- ✅ Smart contract with security features
- ✅ Comprehensive test suite
- ✅ Deployment scripts

### Phase 2 (Next)
- [ ] Web3 integration (wagmi/viem)
- [ ] Wallet connection
- [ ] Real-time name availability checking
- [ ] Transaction history

### Phase 3 (Future)
- [ ] The Graph subgraph for indexing
- [ ] IPFS integration for data storage
- [ ] ENS-style subdomain support
- [ ] Batch operations
- [ ] Governance system

## FAQ

**Q: What is the registration fee?**  
A: Currently set to 0.001 ETH, configurable by contract owner.

**Q: Can I change my registered data?**  
A: Yes, use the `update()` function as the name owner.

**Q: Can I transfer my name to someone else?**  
A: Yes, use the `transfer()` function.

**Q: What happens if the contract is paused?**  
A: No registrations, updates, or transfers can occur, but queries still work.

**Q: Is there a name length limit?**  
A: Yes, names are limited to 32 characters and data to 256 characters.

## Resources

- [Base Documentation](https://docs.base.org)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Create an [Issue](https://github.com/yourusername/baseregistry/issues)
- Join our community discussions
- Follow the project for updates

## Acknowledgments

- Built on [Base](https://base.org) L2
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Security contracts from [OpenZeppelin](https://openzeppelin.com)

---

**Built with ❤️ on Base**
