// Importing the Contract
var Election = artifacts.require("./Election.sol");


// Contract Testing
contract("Election", function(accounts) {
  var electionInstance;

  // Test case 1: Verify initialization with two candidates
  it("should initialize with two candidates", function() {
    return Election.deployed().then(function(instance) {
      return instance.candidatesCount();
    }).then(function(count) {
      assert.equal(count, 2, "candidatesCount should be initialized to 2");
    });
  });

  // Test case 2: Verify initialization of candidate details
  it("should initialize candidates with correct values", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return Promise.all([
        electionInstance.candidates(1),
        electionInstance.candidates(2)
      ]);
    }).then(function(candidates) {
      // Check details of candidate with ID 1
      assert.equal(candidates[0][0], 1, "candidate ID should be 1");
      assert.equal(candidates[0][1], "Candidate 1", "candidate name should be 'Candidate 1'");
      assert.equal(candidates[0][2], 0, "candidate vote count should be initialized to 0");

      // Check details of candidate with ID 2
      assert.equal(candidates[1][0], 2, "candidate ID should be 2");
      assert.equal(candidates[1][1], "Candidate 2", "candidate name should be 'Candidate 2'");
      assert.equal(candidates[1][2], 0, "candidate vote count should be initialized to 0");
    });
  });
});

