import { ethers, run, network } from "hardhat";

async function main() {
    console.log("Deploying BaseRegistry to", network.name);

    // Configuration
    const REGISTRATION_FEE = ethers.parseEther("0.001"); // 0.001 ETH

    console.log("Registration fee:", ethers.formatEther(REGISTRATION_FEE), "ETH");

    // Deploy
    const BaseRegistry = await ethers.getContractFactory("BaseRegistry");
    const baseRegistry = await BaseRegistry.deploy(REGISTRATION_FEE);

    await baseRegistry.waitForDeployment();

    const address = await baseRegistry.getAddress();
    console.log("BaseRegistry deployed to:", address);

    // Wait for block confirmations before verification
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("Waiting for block confirmations...");
        await baseRegistry.deploymentTransaction()?.wait(6);

        // Verify contract on Basescan
        console.log("Verifying contract on Basescan...");
        try {
            await run("verify:verify", {
                address: address,
                constructorArguments: [REGISTRATION_FEE],
            });
            console.log("Contract verified successfully");
        } catch (error: any) {
            if (error.message.toLowerCase().includes("already verified")) {
                console.log("Contract already verified");
            } else {
                console.error("Verification failed:", error);
            }
        }
    }

    // Output deployment info
    console.log("\n=== Deployment Summary ===");
    console.log("Network:", network.name);
    console.log("Contract Address:", address);
    console.log("Registration Fee:", ethers.formatEther(REGISTRATION_FEE), "ETH");
    console.log("Owner:", (await ethers.getSigners())[0].address);
    console.log("\nAdd this to your .env file:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
