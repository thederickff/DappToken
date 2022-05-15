var DappToken = artifacts.require('DappToken');

contract('DappToken', accounts => {
  it('sets the total supply upon deployment', async () => {
    const instance = await DappToken.deployed();
    const supply = await instance.totalSupply();
    assert.equal(supply, 1000000, 'sets the total supply to 1,000,000');
  })
});