const { ethers, network } = require("hardhat");
const { distribution } = require("./rewardDistribution2.json");
const MerkletreeSpecs = require("./MerkletreeSpecs")
async function main() {
	if(network.name =="rinkeby"){
	console.log(`Claiming  amount by user in ${network.name} with default index as 0`);
	const index = 0
	const merkletreeSpecs = new MerkletreeSpecs()
	const merkleProof = merkletreeSpecs.getMerkleProof(index)
	const rewardDistributorAddress = "0x60d4663A0874cAa6CF7504f8c93e8cac9A60A83a"
	const rewardDistributor = await ethers.getContractAt("SimpleRewardDistributor",rewardDistributorAddress)
	
	await rewardDistributor.claim(index,distribution[index].address,distribution[index].amount,merkleProof)
	console.log("Claimed");
	}
	else{
		console.log("Claiming only on network rinkeby run script as npx hardhat run  '.\scripts\claimReward.js' --network rinkeby");
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
