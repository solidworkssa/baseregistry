import { expect } from "chai";
import { ethers } from "hardhat";
import { BaseRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("BaseRegistry", function () {
    let baseRegistry: BaseRegistry;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let user3: SignerWithAddress;

    const REGISTRATION_FEE = ethers.parseEther("0.001");
    const TEST_NAME = "testname";
    const TEST_DATA = "ipfs://QmTest123";
    const UPDATED_DATA = "ipfs://QmUpdated456";

    beforeEach(async function () {
        [owner, user1, user2, user3] = await ethers.getSigners();

        const BaseRegistryFactory = await ethers.getContractFactory("BaseRegistry");
        baseRegistry = await BaseRegistryFactory.deploy(REGISTRATION_FEE);
        await baseRegistry.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await baseRegistry.owner()).to.equal(owner.address);
        });

        it("Should set the correct registration fee", async function () {
            expect(await baseRegistry.registrationFee()).to.equal(REGISTRATION_FEE);
        });

        it("Should not be paused initially", async function () {
            expect(await baseRegistry.paused()).to.be.false;
        });
    });

    describe("Registration", function () {
        it("Should allow registration with correct fee", async function () {
            await expect(
                baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, {
                    value: REGISTRATION_FEE,
                })
            )
                .to.emit(baseRegistry, "Registered")
                .withArgs(TEST_NAME, user1.address, TEST_DATA, await time.latest() + 1);

            const record = await baseRegistry.getRecord(TEST_NAME);
            expect(record.owner).to.equal(user1.address);
            expect(record.data).to.equal(TEST_DATA);
        });

        it("Should refund excess payment", async function () {
            const excessAmount = ethers.parseEther("0.002");
            const initialBalance = await ethers.provider.getBalance(user1.address);

            const tx = await baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, {
                value: excessAmount,
            });
            const receipt = await tx.wait();
            const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

            const finalBalance = await ethers.provider.getBalance(user1.address);
            const expectedBalance = initialBalance - REGISTRATION_FEE - gasUsed;

            expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther("0.0001"));
        });

        it("Should revert if name is empty", async function () {
            await expect(
                baseRegistry.connect(user1).register("", TEST_DATA, {
                    value: REGISTRATION_FEE,
                })
            ).to.be.revertedWith("Name cannot be empty");
        });

        it("Should revert if name is too long", async function () {
            const longName = "a".repeat(33);
            await expect(
                baseRegistry.connect(user1).register(longName, TEST_DATA, {
                    value: REGISTRATION_FEE,
                })
            ).to.be.revertedWith("Name too long");
        });

        it("Should revert if data is too long", async function () {
            const longData = "a".repeat(257);
            await expect(
                baseRegistry.connect(user1).register(TEST_NAME, longData, {
                    value: REGISTRATION_FEE,
                })
            ).to.be.revertedWith("Data too long");
        });

        it("Should revert if name is already registered", async function () {
            await baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, {
                value: REGISTRATION_FEE,
            });

            await expect(
                baseRegistry.connect(user2).register(TEST_NAME, "other data", {
                    value: REGISTRATION_FEE,
                })
            ).to.be.revertedWith("Name already registered");
        });

        it("Should revert if insufficient fee is paid", async function () {
            const insufficientFee = ethers.parseEther("0.0005");
            await expect(
                baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, {
                    value: insufficientFee,
                })
            ).to.be.revertedWith("Insufficient fee");
        });

        it("Should track owned names", async function () {
            await baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, {
                value: REGISTRATION_FEE,
            });

            const ownedNames = await baseRegistry.getOwnedNames(user1.address);
            expect(ownedNames).to.have.lengthOf(1);
            expect(ownedNames[0]).to.equal(TEST_NAME);
        });

        it("Should allow multiple registrations by same user", async function () {
            await baseRegistry.connect(user1).register("name1", TEST_DATA, {
                value: REGISTRATION_FEE,
            });
            await baseRegistry.connect(user1).register("name2", TEST_DATA, {
                value: REGISTRATION_FEE,
            });

            const ownedNames = await baseRegistry.getOwnedNames(user1.address);
            expect(ownedNames).to.have.lengthOf(2);
        });
    });

    describe("Update", function () {
        beforeEach(async function () {
            await baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, {
                value: REGISTRATION_FEE,
            });
        });

        it("Should allow owner to update data", async function () {
            await expect(baseRegistry.connect(user1).update(TEST_NAME, UPDATED_DATA))
                .to.emit(baseRegistry, "Updated")
                .withArgs(TEST_NAME, user1.address, UPDATED_DATA, await time.latest() + 1);

            const record = await baseRegistry.getRecord(TEST_NAME);
            expect(record.data).to.equal(UPDATED_DATA);
        });

        it("Should update the updatedAt timestamp", async function () {
            const recordBefore = await baseRegistry.getRecord(TEST_NAME);

            await time.increase(100);

            await baseRegistry.connect(user1).update(TEST_NAME, UPDATED_DATA);

            const recordAfter = await baseRegistry.getRecord(TEST_NAME);
            expect(recordAfter.updatedAt).to.be.greaterThan(recordBefore.updatedAt);
        });

        it("Should revert if caller is not the owner", async function () {
            await expect(
                baseRegistry.connect(user2).update(TEST_NAME, UPDATED_DATA)
            ).to.be.revertedWith("Not the owner");
        });

        it("Should revert if data is too long", async function () {
            const longData = "a".repeat(257);
            await expect(
                baseRegistry.connect(user1).update(TEST_NAME, longData)
            ).to.be.revertedWith("Data too long");
        });
    });

    describe("Transfer", function () {
        beforeEach(async function () {
            await baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, {
                value: REGISTRATION_FEE,
            });
        });

        it("Should allow owner to transfer name", async function () {
            await expect(baseRegistry.connect(user1).transfer(TEST_NAME, user2.address))
                .to.emit(baseRegistry, "Transferred")
                .withArgs(TEST_NAME, user1.address, user2.address, await time.latest() + 1);

            const record = await baseRegistry.getRecord(TEST_NAME);
            expect(record.owner).to.equal(user2.address);
        });

        it("Should update owned names tracking", async function () {
            await baseRegistry.connect(user1).transfer(TEST_NAME, user2.address);

            const user2Names = await baseRegistry.getOwnedNames(user2.address);
            expect(user2Names).to.include(TEST_NAME);
        });

        it("Should revert if caller is not the owner", async function () {
            await expect(
                baseRegistry.connect(user2).transfer(TEST_NAME, user3.address)
            ).to.be.revertedWith("Not the owner");
        });

        it("Should revert if new owner is zero address", async function () {
            await expect(
                baseRegistry.connect(user1).transfer(TEST_NAME, ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid new owner");
        });

        it("Should revert if transferring to self", async function () {
            await expect(
                baseRegistry.connect(user1).transfer(TEST_NAME, user1.address)
            ).to.be.revertedWith("Already the owner");
        });

        it("Should allow new owner to update after transfer", async function () {
            await baseRegistry.connect(user1).transfer(TEST_NAME, user2.address);

            await expect(
                baseRegistry.connect(user2).update(TEST_NAME, UPDATED_DATA)
            ).to.not.be.reverted;

            const record = await baseRegistry.getRecord(TEST_NAME);
            expect(record.data).to.equal(UPDATED_DATA);
        });
    });

    describe("Query Functions", function () {
        it("Should return correct availability status", async function () {
            expect(await baseRegistry.isAvailable(TEST_NAME)).to.be.true;

            await baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, {
                value: REGISTRATION_FEE,
            });

            expect(await baseRegistry.isAvailable(TEST_NAME)).to.be.false;
        });

        it("Should return empty record for unregistered name", async function () {
            const record = await baseRegistry.getRecord("nonexistent");
            expect(record.owner).to.equal(ethers.ZeroAddress);
            expect(record.data).to.equal("");
            expect(record.createdAt).to.equal(0);
            expect(record.updatedAt).to.equal(0);
        });

        it("Should return correct record details", async function () {
            const tx = await baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, {
                value: REGISTRATION_FEE,
            });
            await tx.wait();

            const record = await baseRegistry.getRecord(TEST_NAME);
            expect(record.owner).to.equal(user1.address);
            expect(record.data).to.equal(TEST_DATA);
            expect(record.createdAt).to.be.greaterThan(0);
            expect(record.updatedAt).to.equal(record.createdAt);
        });
    });

    describe("Admin Functions", function () {
        describe("Fee Management", function () {
            it("Should allow owner to update registration fee", async function () {
                const newFee = ethers.parseEther("0.002");

                await expect(baseRegistry.setRegistrationFee(newFee))
                    .to.emit(baseRegistry, "FeeUpdated")
                    .withArgs(REGISTRATION_FEE, newFee);

                expect(await baseRegistry.registrationFee()).to.equal(newFee);
            });

            it("Should revert if non-owner tries to update fee", async function () {
                const newFee = ethers.parseEther("0.002");

                await expect(
                    baseRegistry.connect(user1).setRegistrationFee(newFee)
                ).to.be.revertedWithCustomError(baseRegistry, "OwnableUnauthorizedAccount");
            });

            it("Should allow setting fee to zero", async function () {
                await baseRegistry.setRegistrationFee(0);
                expect(await baseRegistry.registrationFee()).to.equal(0);

                await expect(
                    baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, { value: 0 })
                ).to.not.be.reverted;
            });
        });

        describe("Pause Functionality", function () {
            it("Should allow owner to pause contract", async function () {
                await baseRegistry.pause();
                expect(await baseRegistry.paused()).to.be.true;
            });

            it("Should allow owner to unpause contract", async function () {
                await baseRegistry.pause();
                await baseRegistry.unpause();
                expect(await baseRegistry.paused()).to.be.false;
            });

            it("Should revert if non-owner tries to pause", async function () {
                await expect(
                    baseRegistry.connect(user1).pause()
                ).to.be.revertedWithCustomError(baseRegistry, "OwnableUnauthorizedAccount");
            });

            it("Should prevent registration when paused", async function () {
                await baseRegistry.pause();

                await expect(
                    baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, {
                        value: REGISTRATION_FEE,
                    })
                ).to.be.revertedWithCustomError(baseRegistry, "EnforcedPause");
            });

            it("Should prevent updates when paused", async function () {
                await baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, {
                    value: REGISTRATION_FEE,
                });

                await baseRegistry.pause();

                await expect(
                    baseRegistry.connect(user1).update(TEST_NAME, UPDATED_DATA)
                ).to.be.revertedWithCustomError(baseRegistry, "EnforcedPause");
            });

            it("Should prevent transfers when paused", async function () {
                await baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, {
                    value: REGISTRATION_FEE,
                });

                await baseRegistry.pause();

                await expect(
                    baseRegistry.connect(user1).transfer(TEST_NAME, user2.address)
                ).to.be.revertedWithCustomError(baseRegistry, "EnforcedPause");
            });

            it("Should allow queries when paused", async function () {
                await baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, {
                    value: REGISTRATION_FEE,
                });

                await baseRegistry.pause();

                await expect(baseRegistry.getRecord(TEST_NAME)).to.not.be.reverted;
                await expect(baseRegistry.isAvailable(TEST_NAME)).to.not.be.reverted;
            });
        });

        describe("Withdrawal", function () {
            beforeEach(async function () {
                await baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, {
                    value: REGISTRATION_FEE,
                });
            });

            it("Should allow owner to withdraw funds", async function () {
                const contractBalance = await ethers.provider.getBalance(
                    await baseRegistry.getAddress()
                );
                expect(contractBalance).to.equal(REGISTRATION_FEE);

                const initialBalance = await ethers.provider.getBalance(owner.address);

                await expect(baseRegistry.withdraw(owner.address))
                    .to.emit(baseRegistry, "FundsWithdrawn")
                    .withArgs(owner.address, REGISTRATION_FEE);

                const finalBalance = await ethers.provider.getBalance(owner.address);
                expect(finalBalance).to.be.greaterThan(initialBalance);
            });

            it("Should revert if non-owner tries to withdraw", async function () {
                await expect(
                    baseRegistry.connect(user1).withdraw(user1.address)
                ).to.be.revertedWithCustomError(baseRegistry, "OwnableUnauthorizedAccount");
            });

            it("Should revert if withdrawal address is zero", async function () {
                await expect(
                    baseRegistry.withdraw(ethers.ZeroAddress)
                ).to.be.revertedWith("Invalid address");
            });

            it("Should revert if no funds to withdraw", async function () {
                await baseRegistry.withdraw(owner.address);

                await expect(
                    baseRegistry.withdraw(owner.address)
                ).to.be.revertedWith("No funds to withdraw");
            });
        });
    });

    describe("Gas Optimization", function () {
        it("Should have reasonable gas cost for registration", async function () {
            const tx = await baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, {
                value: REGISTRATION_FEE,
            });
            const receipt = await tx.wait();

            console.log("Registration gas used:", receipt!.gasUsed.toString());
            expect(receipt!.gasUsed).to.be.lessThan(200000n);
        });

        it("Should have reasonable gas cost for update", async function () {
            await baseRegistry.connect(user1).register(TEST_NAME, TEST_DATA, {
                value: REGISTRATION_FEE,
            });

            const tx = await baseRegistry.connect(user1).update(TEST_NAME, UPDATED_DATA);
            const receipt = await tx.wait();

            console.log("Update gas used:", receipt!.gasUsed.toString());
            expect(receipt!.gasUsed).to.be.lessThan(100000n);
        });
    });

    describe("Edge Cases", function () {
        it("Should handle maximum length name", async function () {
            const maxName = "a".repeat(32);
            await expect(
                baseRegistry.connect(user1).register(maxName, TEST_DATA, {
                    value: REGISTRATION_FEE,
                })
            ).to.not.be.reverted;
        });

        it("Should handle maximum length data", async function () {
            const maxData = "a".repeat(256);
            await expect(
                baseRegistry.connect(user1).register(TEST_NAME, maxData, {
                    value: REGISTRATION_FEE,
                })
            ).to.not.be.reverted;
        });

        it("Should handle special characters in name", async function () {
            const specialName = "test-name_123";
            await expect(
                baseRegistry.connect(user1).register(specialName, TEST_DATA, {
                    value: REGISTRATION_FEE,
                })
            ).to.not.be.reverted;
        });

        it("Should accept direct ETH transfers", async function () {
            await expect(
                owner.sendTransaction({
                    to: await baseRegistry.getAddress(),
                    value: ethers.parseEther("1.0"),
                })
            ).to.not.be.reverted;
        });
    });
});
