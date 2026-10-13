import { expect } from "chai";
import { network } from "hardhat";
import VendingModule from "../ignition/modules/Deploy.js";


const { ethers, ignition } = await network.create();

describe("Testing our Vending Machine", function () {

    async function vendingMachineDeploy() {
        const [owner, buyer] = await ethers.getSigners();

        const { vendingMachine, sodaVendor } =
            await ignition.deploy(VendingModule);

        return { owner, buyer, vendingMachine, sodaVendor };
    }

    it("Should correctly set the deployer as owner", async function () {
        const { owner, vendingMachine } =
            await vendingMachineDeploy();

        const ownerOfVendingMachine =
            await vendingMachine.owner();

        expect(ownerOfVendingMachine).to.equal(owner.address);
    });

    // it("Should initialize with 100 sodas", async function () {
    //     const { vendingMachine } =
    //         await vendingMachineDeploy();

    //     expect(await vendingMachine.soda()).to.equal(100n);
    // });


    it("Should Revert if some Payment is failed", async function () {
        const { owner, vendingMachine } =
            await vendingMachineDeploy();

        const price = 1;
        // 1 wei

        await expect(
            vendingMachine.connect(owner).buySoda({ value: price })
        ).to.be.revertedWith("Incorrect Payment amount for Soda");
    });

    it("Should prevent non-owners from withdrawing funds", async function () {
        const { buyer, vendingMachine, sodaVendor } =
            await vendingMachineDeploy();

        const price = await sodaVendor.getPrice();

        await vendingMachine.connect(buyer).buySoda({ value: price });

        await expect(
            vendingMachine.connect(buyer).withdraw()
        ).to.be.revertedWith("You are not the owner");
    });


    it("Should Prevent Buying Soda if stock is zero", async function () {

        const { buyer, vendingMachine, sodaVendor } =
            await vendingMachineDeploy();

        const price = await sodaVendor.getPrice();

        for (let i = 0; i < 100; i++) {
            await vendingMachine.connect(buyer).buySoda({ value: price });
        }

        expect(await vendingMachine.soda()).to.equal(0);

        await expect(
            vendingMachine.connect(buyer).buySoda({ value: price })
        ).to.be.revertedWith("Soda, out of stock!");

    });



    it("Should transfer the full balance to the owner upon withdrawal", async function () {
        const { buyer, vendingMachine, sodaVendor, owner } =
            await vendingMachineDeploy();

        const price = await sodaVendor.getPrice();

        await vendingMachine.connect(buyer).buySoda({ value: price });

        const contractBalanceBefore = await ethers.provider.getBalance(
            await vendingMachine.getAddress()
        );

        await vendingMachine.connect(owner).withdraw();

        const contractBalanceAfter = await ethers.provider.getBalance(
            await vendingMachine.getAddress()
        );

        expect(contractBalanceBefore).to.equal(price);
        expect(contractBalanceAfter).to.equal(0n);
    });


    it("Should emit a SodaPurchase event with correct arguments on success", async function () {
        const { buyer, vendingMachine, sodaVendor } =
            await vendingMachineDeploy();

        const price = await sodaVendor.getPrice();

        await expect(
            vendingMachine.connect(buyer).buySoda({ value: price })
        ).to.emit(vendingMachine, "SodaPurchase").withArgs(buyer.address, 1);
    });


    it("Should allow the owner to restock soda successfully", async function () {
        const { owner, vendingMachine } =
            await vendingMachineDeploy();

        await vendingMachine.connect(owner).addStock(50);

        expect(await vendingMachine.soda()).to.equal(150n);
    });


    it("Should prevent non-owners from restocking soda", async function () {
        const { buyer, vendingMachine } =
            await vendingMachineDeploy();

        await expect(
            vendingMachine.connect(buyer).addStock(50)
        ).to.be.revertedWith("You are not the owner");
    });


});


