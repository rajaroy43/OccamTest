const MerkletreeSpecs = require("./MerkletreeSpecs")
async function getMerkleProof() {
  const index = parseInt(process.argv[2])
  const merkletreeSpecs = new MerkletreeSpecs()
  console.log("Getting Merkle proof for user")
	const merkleProof = merkletreeSpecs.getMerkleProof(index)
	console.log(merkleProof)
}

getMerkleProof()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
