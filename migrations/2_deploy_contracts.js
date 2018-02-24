var Ownable = artifacts.require("./Ownable.sol");
var SafeMath = artifacts.require("./SafeMath.sol");
var Payroll = artifacts.require("./Ride.sol");

module.exports = function(deployer) {
  deployer.deploy(Ownable);
  deployer.deploy(SafeMath);

  deployer.link(Ownable, Ride);
  deployer.link(SafeMath, Ride);
  deployer.deploy(Ride);
};
