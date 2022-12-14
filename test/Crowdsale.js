const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether') // converts 1000 to Ether = 1000000000000000000000000
}

const ether = tokens


describe('Crowdsale', () => {
    let crowdsale, token
    let accounts, deployer, user1

    beforeEach(async () => {
        // Load Contracts
        const Crowdsale = await ethers.getContractFactory('Crowdsale') // Pull in Crowdsale contract from Hardhat
        const Token = await ethers.getContractFactory('Token') // token is deployed

        // Deploy Tokens
        token = await Token.deploy('Sobek', 'SOB', '1000000') // Token is deployed

        // Configure Accounts 
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        user1 = accounts[1]

        // Deploy Crowdsale - ICO Contract to hold tokens
        crowdsale = await Crowdsale.deploy(token.address, ether(1), '1000000') // crowdsale is deployed

       // Send Tokens to crowdsale
       let transaction = await token.connect(deployer).transfer(crowdsale.address, tokens(1000000)) 
        await transaction.wait()
    })

    describe('Deployment', () => {
        
        it('Sends tokens to the Crowdsale contract', async () => {
            expect(await token.balanceOf(crowdsale.address)).to.equal(tokens(1000000))
        }) 

        it('Returns the price', async () => {
            expect(await crowdsale.price()).to.equal(ether(1))
        })

        it('Returns token address', async () => {
            expect(await crowdsale.token()).to.equal(token.address)
        })            
    })

    describe('Buying Tokens', () => {
        let transaction, result
        let amount = tokens(10)
        
        describe('Success', () => {

            beforeEach(async () => {
              transaction = await crowdsale.connect(user1).buyTokens(amount, { value: ether(10) })
              result = await transaction.wait()                
            })

            it('transfers tokens', async () => {
                expect(await token.balanceOf(crowdsale.address)).to.equal(tokens(999990))
                expect(await token.balanceOf(user1.address)).to.equal(amount)
            })

            it('Updates contracts ether balance', async () => {
                expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(amount)
            })
                        
             it('Updates tokensSold', async () => {
                 expect(await crowdsale.tokensSold()).to.equal(amount)
            })

            it('Emits a buy event', async () => {
               // https://hardhat.org/hardhat-chai-matchers/docs/reference#.emit 
               await expect(transaction).to.emit(crowdsale, 'Buy').withArgs(amount, user1.address)
            })
        })
        
        
        describe('Failure', () => {            

             it('Rejects insufficient ETH', async () => {
                console.log(result)        
                 await expect(crowdsale.connect(user1).buyTokens(tokens(10), { value: 0 })).to.be.reverted  // if they don't send Ether in it fails
             })
         })        
                    
    })

    describe('Sending ETH', () => {
        let transaction, result
        let amount = ether(10)

        describe('Success', () => {

            beforeEach(async () => {
              transaction = await user1.sendTransaction({ to: crowdsale.address, value: amount })
              result = await transaction.wait()                
            })           

            it('Updates contracts ether balance', async () => {
                expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(amount)
            })
            
            it('Updates user token balance', async () => {
                expect(await token.balanceOf(user1.address)).to.equal(amount)
            })                        
        })
    })  
    
    describe('Updating Price', () => {
        let transaction, result
        let price = ether(2)

        describe('Success', () => {

            beforeEach(async () => {
                transaction = await crowdsale.connect(deployer).setPrice(ether(2))
                result = await transaction.wait()
            })

            it('Updates the price', async () => {
                expect(await crowdsale.price()).to.equal(ether(2))
            })
        })

        describe('Failure', () => {

            it('Prevents non-owner from updating price', async () => {
                await expect(crowdsale.connect(user1).setPrice(price)).to.be.reverted
            })
        })
    })

    
    describe('Finalizing Sale', () => {
        let transaction, result
        let amount = tokens(10)
        let value = ether(10)

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await crowdsale.connect(user1).buyTokens(amount, { value: value})
                result = await transaction.wait()

                transaction = await crowdsale.connect(deployer).finalize()
                result = await transaction.wait()
            })

            it('Transfers remaining tokens to owner', async () => {
                expect(await token.balanceOf(crowdsale.address)).to.equal(0)
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999990))
            })

            it('Transfers ETH balance to owner', async () => {
                expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(0)
            })

            it('Emits Finalize event', async () => {
                // https://hardhat.org/hardhat-chai-matchers/docs/reference#.emt
                await expect(transaction).to.emit(crowdsale, "Finalize")
                    .withArgs(amount, value)
            })
        })

        describe('Failure', () => {

            it('Prevents non-owner from finalizing', async () => {
                await expect(crowdsale.connect(user1).finalize()).to.be.reverted
             })
        
        })
    })
})

