const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether') // converts 1000 to Ether = 1000000000000000000000000
}

describe('Crowdsale', () => {
    let crowdsale

    beforeEach(async () => {
        const Crowdsale = await ethers.getContractFactory('Crowdsale') // Pull in Crowdsale contract from Hardhat
        crowdsale = await Crowdsale.deploy()

    })

    describe('Deployment', () => {
        it('Has a name', async () => {
            
            expect(await crowdsale.name()).to.eq("Crowdsale")
        })
    })

})
