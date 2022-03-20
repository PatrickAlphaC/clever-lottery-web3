const { frontEndContractsFile, frontEndAbiFile } = require("../helper-hardhat-config")
const fs = require("fs")
const { network } = require("hardhat")
const FormatTypes = ethers.utils.FormatTypes

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const lottery = await ethers.getContract("Lottery")
    fs.writeFileSync(frontEndAbiFile, lottery.interface.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddresses() {
    const lottery = await ethers.getContract("Lottery")
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (network.config.chainId.toString() in contractAddresses) {
        if (!contractAddresses[network.config.chainId.toString()].includes(lottery.address)) {
            contractAddresses[network.config.chainId.toString()].push(lottery.address)
        }
    } else {
        contractAddresses[network.config.chainId.toString()] = [lottery.address]
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]
