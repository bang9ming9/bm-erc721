import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

describe("BmErc721", function () {
    async function deployContracts() {
        const [owner, ...eoas] = await hre.ethers.getSigners();

        const ERC721 = await hre.ethers.getContractFactory("BmErc721");
        const ERC1155 = await hre.ethers.getContractFactory("TERC1155");

        const erc1155 = await ERC1155.deploy();
        const erc721 = await ERC721.deploy(owner.address, await erc1155.getAddress(), "BMERC721", "BMNFT");

        return { owner, eoas, erc1155, erc721 };
    }

    // TC1: hardhat deploy test
    describe("TC1", function () {
        it("Should set the right owner", async function () {
            const { owner, erc721 } = await loadFixture(deployContracts);
            expect(owner.address).to.equal(await erc721.owner());
        });
        it("Should set the right erc1155", async function () {
            const { erc1155, erc721 } = await loadFixture(deployContracts);
            expect(await erc1155.getAddress()).to.equal(await erc721.BM_ERC1155());
        });
    })
    // TC2: Mint ERC721
    describe("TC2", function () {
        describe("Fail to mint", function () {
            it("not approve", async function () {
                const { eoas, erc1155, erc721 } = await loadFixture(deployContracts);
                const eoa = eoas[0];
                const mint = erc721.connect(eoa)["mint(uint256,string)"]
                await expect(mint(1, "TC2")).to.be.revertedWithCustomError(erc1155, "ERC1155MissingApprovalForAll");
            })
            it("have no erc1155 balance", async function () {
                const { eoas, erc1155, erc721 } = await loadFixture(deployContracts);
                const eoa = eoas[0];

                await erc1155.connect(eoa).setApprovalForAll(await erc721.getAddress(), true);
                const mint = erc721.connect(eoa)["mint(uint256,string)"]
                await expect(mint(1, "TC2")).to.be.revertedWithCustomError(erc1155, "ERC1155InsufficientBalance");
            })
        })
        it("Success to mint ERC721", async function () {
            const { eoas, erc1155, erc721 } = await loadFixture(deployContracts);
            const COST = await erc721.MINT_COST();
            const eoa = eoas[0];

            await erc1155.connect(eoa).mint(1, COST);
            await erc1155.connect(eoa).setApprovalForAll(await erc721.getAddress(), true);
            const mint = erc721.connect(eoa)["mint(uint256,string)"]
            await expect(mint(1, "https://github.com/bang9ming9"))
                .to.emit(erc721, "Transfer")
                .withArgs(ZERO_ADDRESS, eoa.address, 1);

            expect(await erc721.tokenData(1)).to.equal("https://github.com/bang9ming9");
        })
        it("Fail to mint(Batch) ERC721", async function () {
            const { eoas, erc1155, erc721 } = await loadFixture(deployContracts);
            const COST = await erc721.MINT_COST();
            const eoa = eoas[0];
            const halfCost = COST / BigInt('2');

            await erc1155.connect(eoa).mint(1, halfCost);
            await erc1155.connect(eoa).mint(2, halfCost);
            await erc1155.connect(eoa).mint(3, halfCost);
            await erc1155.connect(eoa).setApprovalForAll(await erc721.getAddress(), true);

            const mint = erc721.connect(eoa)["mint(uint256[],uint256[],string)"]
            // input 의 길이가 다르다
            await expect(mint([1, 2, 3], [halfCost, halfCost], "https://github.com/bang9ming9")).to.be.reverted
            // 입력 잔액, input 배열의 길이가 다르다
            await expect(mint([1, 2], [halfCost, halfCost, halfCost], "https://github.com/bang9ming9")).to.be.reverted
            // 입력 잔액이 COST 와 다르다
            await expect(mint([1, 2], [halfCost, COST], "https://github.com/bang9ming9")).to.be.reverted
            await expect(mint([1, 2, 3], [halfCost, halfCost, halfCost], "https://github.com/bang9ming9")).to.be.reverted
        })
        it("Success to mint(Batch) ERC721", async function () {
            const { eoas, erc1155, erc721 } = await loadFixture(deployContracts);
            const COST = await erc721.MINT_COST();
            const eoa = eoas[0];
            const halfCost = COST / BigInt('2');

            await erc1155.connect(eoa).mint(1, halfCost);
            await erc1155.connect(eoa).mint(2, halfCost);
            await erc1155.connect(eoa).setApprovalForAll(await erc721.getAddress(), true);

            const mint = erc721.connect(eoa)["mint(uint256[],uint256[],string)"]

            await expect(mint([1, 2], [halfCost, halfCost], "https://github.com/bang9ming9"))
                .to.emit(erc721, "Transfer")
                .withArgs(ZERO_ADDRESS, eoa.address, 1);

            expect(await erc721.tokenData(1)).to.equal("https://github.com/bang9ming9");
        })
    })
});