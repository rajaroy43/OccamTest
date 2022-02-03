const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const MerkletreeSpecs = require("../scripts/MerkletreeSpecs");
const { solidity } = require("ethereum-waffle");
const { distribution } = require("../scripts//rewardDistribution2.json");
use(solidity);
describe("Reward Destribution Merkle proof verification", function () {
	let rewardDistributor, testToken, merkletreeSpecs,depositAmount;
	beforeEach(async () => {
		const SimpleRewardDistributor = await ethers.getContractFactory("SimpleRewardDistributor");
		const TestErc20 = await ethers.getContractFactory("TestTokenWithNameAndSymbol");
		depositAmount = ethers.utils.parseUnits("10000000000000000", 18);
		const tokenArgs = [depositAmount, "testtoken", "test"];
		testToken = await TestErc20.deploy(...tokenArgs);
		merkletreeSpecs = new MerkletreeSpecs();
		const merkleRoot = merkletreeSpecs.getMerkleRoot();
		const rewardDistributorArgs = [testToken.address, merkleRoot];
		rewardDistributor = await SimpleRewardDistributor.deploy(...rewardDistributorArgs);
		await testToken.transfer(rewardDistributor.address, depositAmount);
	});

  it('reward should claimed by all users',async()=>{
      distribution.forEach(async(user) => {
        const index = user.index
        const account = ethers.utils.getAddress(user.address)
        const amount = ethers.BigNumber.from(user.amount)
        const merkleProof = merkletreeSpecs.getMerkleProof(index)
        const args = [index,account,amount,merkleProof]
        const userBalanceBeforeClaim = await testToken.balanceOf(account);
        await expect(rewardDistributor.claim(...args))
          .emit(rewardDistributor,"Claimed")
          .withArgs(index,account,amount)
        const userBalanceAfterClaim = await testToken.balanceOf(account);
        expect(userBalanceBeforeClaim.add(amount)).to.equal(userBalanceAfterClaim)
      })
  });

    it('reward should  claimed by user1  at a time',async()=>{
      const user = distribution[0]
      const index = user.index
      const account = user.address
      const amount = user.amount
      const merkleProof = merkletreeSpecs.getMerkleProof(index)
      const args = [index,account,amount,merkleProof]
      const userBalanceBeforeClaim = await testToken.balanceOf(account);
      await expect(rewardDistributor.claim(...args))
        .emit(rewardDistributor,"Claimed")
        .withArgs(index,account,amount)
      const userBalanceAfterClaim = await testToken.balanceOf(account);
      expect(userBalanceBeforeClaim.add(amount)).to.equal(userBalanceAfterClaim)
    });

    it('reward should not claimed by user1  twice',async()=>{
      const user = distribution[0]
      const index = user.index
      const account = user.address
      const amount = user.amount
      const merkleProof = merkletreeSpecs.getMerkleProof(index)
      const args = [index,account,amount,merkleProof]
      const userBalanceBeforeClaim = await testToken.balanceOf(account);
      await expect(rewardDistributor.claim(...args))
        .emit(rewardDistributor,"Claimed")
        .withArgs(index,account,amount)
      const userBalanceAfterClaim = await testToken.balanceOf(account);
      expect(userBalanceBeforeClaim.add(amount)).to.equal(userBalanceAfterClaim)
      await expect(rewardDistributor.claim(...args))
        .to.be.revertedWith("MerkleDistributor: Drop already claimed.")

    });

    it('reward should  not claimed by user1  if modified index',async()=>{
      const user = distribution[0]
      const index = user.index + 1
      const account = user.address
      const amount = user.amount
      const merkleProof = merkletreeSpecs.getMerkleProof(index)
      const args = [index,account,amount,merkleProof]
      await expect(rewardDistributor.claim(...args))
        .to.be.revertedWith("MerkleDistributor: Invalid proof.")
    });

    it('reward should  not claimed by user1  if modified address',async()=>{
      const user = distribution[0]
      const index = user.index 
      const account = distribution[1].address
      const amount = user.amount
      const merkleProof = merkletreeSpecs.getMerkleProof(index)
      const args = [index,account,amount,merkleProof]
      await expect(rewardDistributor.claim(...args))
        .to.be.revertedWith("MerkleDistributor: Invalid proof.")
    });

    it('reward should  not claimed by user1  if modified amount',async()=>{
      const user = distribution[0]
      const index = user.index 
      const account = user.address
      const amount = ethers.BigNumber.from(user.amount).add(1)
      const merkleProof = merkletreeSpecs.getMerkleProof(index)
      const args = [index,account,amount,merkleProof]
      await expect(rewardDistributor.claim(...args))
        .to.be.revertedWith("MerkleDistributor: Invalid proof.")
    });

    it('reward should  not claimed by user1  if modified merkle proof',async()=>{
      const user = distribution[0]
      const index = user.index 
      const account = user.address
      const amount = user.amount
      const merkleProof = merkletreeSpecs.getMerkleProof(index+4)
      const args = [index,account,amount,merkleProof]
      await expect(rewardDistributor.claim(...args))
        .to.be.revertedWith("MerkleDistributor: Invalid proof.")
    });
  
});
