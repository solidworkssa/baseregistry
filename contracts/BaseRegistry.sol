// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BaseRegistry
 * @dev A secure registry contract for the Base ecosystem.
 * Users can register unique names and associate string data with them.
 * Includes ownership transfer, access control, and emergency pause functionality.
 */
contract BaseRegistry is Ownable, ReentrancyGuard, Pausable {
    // Constants
    uint256 public constant MAX_NAME_LENGTH = 32;
    uint256 public constant MAX_DATA_LENGTH = 256;
    
    // State variables
    uint256 public registrationFee;
    
    struct Record {
        address owner;
        string data;
        uint256 createdAt;
        uint256 updatedAt;
    }

    // Mapping from name to Record
    mapping(string => Record) private _registry;
    
    // Mapping to track names owned by each address
    mapping(address => string[]) private _ownedNames;

    // Events
    event Registered(
        string indexed name,
        address indexed owner,
        string data,
        uint256 timestamp
    );
    
    event Updated(
        string indexed name,
        address indexed owner,
        string data,
        uint256 timestamp
    );
    
    event Transferred(
        string indexed name,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    
    event FundsWithdrawn(address indexed to, uint256 amount);

    /**
     * @dev Constructor sets the initial owner and registration fee
     * @param _initialFee Initial registration fee in wei
     */
    constructor(uint256 _initialFee) Ownable(msg.sender) {
        registrationFee = _initialFee;
    }

    /**
     * @dev Register a new name with data.
     * @param name The unique name to register.
     * @param data The data to associate with the name.
     * 
     * Requirements:
     * - Contract must not be paused
     * - Name must not be empty
     * - Name length must not exceed MAX_NAME_LENGTH
     * - Data length must not exceed MAX_DATA_LENGTH
     * - Name must not be already registered
     * - Sufficient fee must be paid
     */
    function register(string calldata name, string calldata data) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
    {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(name).length <= MAX_NAME_LENGTH, "Name too long");
        require(bytes(data).length <= MAX_DATA_LENGTH, "Data too long");
        require(_registry[name].owner == address(0), "Name already registered");
        require(msg.value >= registrationFee, "Insufficient fee");

        _registry[name] = Record({
            owner: msg.sender,
            data: data,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        _ownedNames[msg.sender].push(name);

        emit Registered(name, msg.sender, data, block.timestamp);
        
        // Refund excess payment
        if (msg.value > registrationFee) {
            (bool success, ) = msg.sender.call{value: msg.value - registrationFee}("");
            require(success, "Refund failed");
        }
    }

    /**
     * @dev Update data for an existing name.
     * @param name The name to update.
     * @param data The new data.
     * 
     * Requirements:
     * - Contract must not be paused
     * - Caller must be the owner of the name
     * - Data length must not exceed MAX_DATA_LENGTH
     */
    function update(string calldata name, string calldata data) 
        external 
        whenNotPaused 
    {
        require(_registry[name].owner == msg.sender, "Not the owner");
        require(bytes(data).length <= MAX_DATA_LENGTH, "Data too long");

        _registry[name].data = data;
        _registry[name].updatedAt = block.timestamp;

        emit Updated(name, msg.sender, data, block.timestamp);
    }

    /**
     * @dev Transfer ownership of a name to another address.
     * @param name The name to transfer.
     * @param newOwner The address of the new owner.
     * 
     * Requirements:
     * - Contract must not be paused
     * - Caller must be the current owner
     * - New owner must not be zero address
     */
    function transfer(string calldata name, address newOwner) 
        external 
        whenNotPaused 
    {
        require(_registry[name].owner == msg.sender, "Not the owner");
        require(newOwner != address(0), "Invalid new owner");
        require(newOwner != msg.sender, "Already the owner");

        address previousOwner = msg.sender;
        _registry[name].owner = newOwner;
        _registry[name].updatedAt = block.timestamp;
        
        // Update ownership tracking
        _ownedNames[newOwner].push(name);

        emit Transferred(name, previousOwner, newOwner, block.timestamp);
    }

    /**
     * @dev Get record details.
     * @param name The name to query.
     * @return owner The owner address
     * @return data The associated data
     * @return createdAt Creation timestamp
     * @return updatedAt Last update timestamp
     */
    function getRecord(string calldata name) 
        external 
        view 
        returns (
            address owner,
            string memory data,
            uint256 createdAt,
            uint256 updatedAt
        ) 
    {
        Record memory record = _registry[name];
        return (record.owner, record.data, record.createdAt, record.updatedAt);
    }
    
    /**
     * @dev Check if a name is available for registration.
     * @param name The name to check.
     * @return bool True if available, false otherwise
     */
    function isAvailable(string calldata name) external view returns (bool) {
        return _registry[name].owner == address(0);
    }
    
    /**
     * @dev Get all names owned by an address.
     * @param owner The address to query.
     * @return string[] Array of owned names
     */
    function getOwnedNames(address owner) external view returns (string[] memory) {
        return _ownedNames[owner];
    }

    /**
     * @dev Update the registration fee. Only callable by owner.
     * @param newFee The new registration fee in wei.
     */
    function setRegistrationFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = registrationFee;
        registrationFee = newFee;
        emit FeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Pause the contract. Only callable by owner.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract. Only callable by owner.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw accumulated fees. Only callable by owner.
     * @param to The address to send funds to.
     */
    function withdraw(address payable to) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid address");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = to.call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(to, balance);
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
