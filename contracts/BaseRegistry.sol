// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BaseRegistry
 * @dev A simple registry contract for the Base ecosystem.
 * Users can register a unique name and associate string data with it.
 */
contract BaseRegistry {
    struct Record {
        address owner;
        string data;
        uint256 createdAt;
        uint256 updatedAt;
    }

    // Mapping from name to Record
    mapping(string => Record) private _registry;

    // Event emitted when a new name is registered
    event Registered(string indexed name, address indexed owner, string data);
    
    // Event emitted when data is updated
    event Updated(string indexed name, address indexed owner, string data);

    /**
     * @dev Register a new name with data.
     * @param name The unique name to register.
     * @param data The data to associate with the name.
 
     * Requirements:
     * - Name must not be empty.
     * - Name must not be already registered.
     */
    function register(string calldata name, string calldata data) external {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(_registry[name].owner == address(0), "Name already registered");

        _registry[name] = Record({
            owner: msg.sender,
            data: data,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        emit Registered(name, msg.sender, data);
    }

    /**
     * @dev Update data for an existing name.
     * @param name The name to update.
     * @param data The new data.
     * 
     * Requirements:
     * - Caller must be the owner of the name.
     */
    function update(string calldata name, string calldata data) external {
        require(_registry[name].owner == msg.sender, "Not the owner");

        _registry[name].data = data;
        _registry[name].updatedAt = block.timestamp;

        emit Updated(name, msg.sender, data);
    }

    /**
     * @dev Get record details.
     * @param name The name to query.
     */
    function getRecord(string calldata name) external view returns (address owner, string memory data, uint256 createdAt, uint256 updatedAt) {
        Record memory record = _registry[name];
        return (record.owner, record.data, record.createdAt, record.updatedAt);
    }
    
    /**
     * @dev Check if a name is validated/available.
     */
    function isAvailable(string calldata name) external view returns (bool) {
        return _registry[name].owner == address(0);
    }
}
