const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const { distribution } = require("./rewardDistribution2.json");
const keccak256 = require("keccak256");
const utils = ethers.utils;

class MerkletreeSpecs {
	constructor() {
		this.leaves = distribution.map((user) => this.toHash(user.index, user.address, ethers.BigNumber.from(user.amount)));
		this.merkleTree = new MerkleTree(this.leaves, keccak256, {  sort: true });
	}

	toHash = (index, address, amount) => {
		const hash = utils.solidityKeccak256(["uint256", "address", "uint256"], [index, address, amount]);
		return Buffer.from(hash.slice(2), "hex");
	};

	getMerkleProof(index) {
		if (index >= distribution.length) {
			throw new Error("Invalid Index");
		}

		const leaf = this.leaves[index];

		const proof = this.merkleTree.getHexProof(leaf);
		return proof;
	}

	getMerkleRoot() {
		return this.merkleTree.getHexRoot();
	}

	verify(index , node){
		const merkleRoot = this.getMerkleRoot()
		const proof = this.getMerkleProof(index)	
		return this.merkleTree.verify(proof,node,merkleRoot)
	}
}

module.exports = MerkletreeSpecs;
