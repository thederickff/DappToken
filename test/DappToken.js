var DappToken = artifacts.require('DappToken');

const assertError = async promise => {
  try {
    await promise;
    assert(false, 'The expected error did not occur.');
  } catch (error) {
    assert(error.message.includes('revert'));
  }
};

const assertEvent = async (promise, event, args) => {
  const receipt = await promise;
  assert.equal(receipt.logs.length, 1, 'no event emitted');
  assert.equal(receipt.logs[0].event, event, 'event name doesn\'t match');
  Object.keys(args).forEach(key => {
    assert.equal(receipt.logs[0].args[key], args[key], `${key} values doesn\'t match`);
  });
};

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
    assert.equal(supply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
  });

  it('should mint all supply to the creator', async () => {
    const instance = await DappToken.deployed();
    const balance = await instance.balanceOf(accounts[0]);

    assert.equal(balance.toNumber(), 1000000);
  });

  it('transfers token ownership', async () => {
    const instance = await DappToken.deployed();
    await assertError(instance.transfer(accounts[1], 99999999));
    const result = await instance.transfer.call(accounts[1], 250000);
    assert.equal(result, true);
    await assertEvent(instance.transfer(accounts[1], 250000), 'Transfer', {
      _from: accounts[0], _to: accounts[1], _value: 250000
    });

    const balance1 = await instance.balanceOf(accounts[1]);
    assert.equal(balance1.toNumber(), 250000)
    const balance0 = await instance.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), 750000)
  });

  it('approves tokens for delegated transfer', async () => {
    const instance = await DappToken.deployed();
    // check approve returns true
    const res = await instance.approve.call(accounts[1], 100);
    assert.equal(res, true);
    // check the Approval event
    await assertEvent(instance.approve(accounts[1], 100), 'Approval', {
      _owner: accounts[0], _spender: accounts[1], _value: 100
    });
    // check allowance[0][1] increased
    const allowance = await instance.allowance(accounts[0], accounts[1]);
    assert.equal(allowance.toNumber(), 100);
  });

  it('should transfer from an allowed account', async () => {
    const instance = await DappToken.deployed();
    // check allowance[0][1] has 100 tokens
    let allowance = await instance.allowance(accounts[0], accounts[1]);
    assert.equal(allowance.toNumber(), 100);
    // check the transfer returns true
    const res = await instance.transferFrom.call(accounts[0], accounts[1], 100, { from: accounts[1] });
    assert.equal(res, true);
    // check the transfer of a value higher than the available _from fails
    await assertError(instance.transferFrom(accounts[0], accounts[2], 9999999, { from: accounts[1] }));
    // check the transfer of a value higher than the available allowance[0][1] fails
    await assertError(instance.transferFrom(accounts[0], accounts[2], 200, { from: accounts[1] }));
    // check valid transfer
    const balance0 = await instance.balanceOf(accounts[0]);
    const balance2 = await instance.balanceOf(accounts[2]);
    await assertEvent(
      instance.transferFrom(accounts[0], accounts[2], 50, { from: accounts[1] }),
      'Transfer', {
        _from: accounts[0], _to: accounts[2], _value: 50
    });
    const balance01 = await instance.balanceOf(accounts[0]);
    // check balance of account 0 decreased
    assert.equal(balance01.toNumber(), balance0.toNumber() - 50);
    // check balance of account 2 increased
    const balance21 = await instance.balanceOf(accounts[2]);
    assert.equal(balance21.toNumber(), balance2.toNumber() + 50);
    // check allowance[0][1] has 50 tokens
    allowance = await instance.allowance(accounts[0], accounts[1]);
    assert.equal(allowance.toNumber(), 50);
  });
});

