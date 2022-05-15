var DappToken = artifacts.require('DappToken');

contract('DappToken', accounts => {

  it('initialized the toke with the correct values', async () => {
    const instance = await DappToken.deployed();
    const name = await instance.name();
    assert.equal(name, 'Dapp Token');
    const symbol = await instance.symbol();
    assert.equal(symbol, 'DAPP');
    const standard = await instance.standard();
    assert.equal(standard, 'Dapp Token v1.0');
  });

  it('sets the total supply upon deployment', async () => {
    const instance = await DappToken.deployed();
    const supply = await instance.totalSupply();
    assert.equal(supply, 1000000, 'sets the total supply to 1,000,000');
  });

  it('should mint all supply to the creator', async () => {
    const instance = await DappToken.deployed();
    const balance = await instance.balanceOf(accounts[0]);

    assert.equal(balance, 1000000);
  });

  it('transfers token ownership', async () => {
    const instance = await DappToken.deployed();

    try {
      await instance.transfer(accounts[1], 99999999);
    } catch (error) {
      assert(error.message.includes('revert'));
    }

    const result = await instance.transfer.call(accounts[1], 250000);
    assert.equal(result, true);
    const receipt = await instance.transfer(accounts[1], 250000);
    assert.equal(receipt.logs[0].event, 'Transfer');
    assert.equal(receipt.logs[0].args._from, accounts[0]);
    assert.equal(receipt.logs[0].args._to, accounts[1]);
    assert.equal(receipt.logs[0].args._value, 250000);

    const balance1 = await instance.balanceOf(accounts[1]);
    assert.equal(balance1, 250000)
    const balance0 = await instance.balanceOf(accounts[0]);
    assert.equal(balance0, 750000)
  })
});