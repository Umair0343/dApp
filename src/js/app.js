App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  // Initialize the application
  init: function() {
    return App.initWeb3();
  },

  // Initialize Web3
  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // Use the existing web3 instance provided by MetaMask
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Or, create a new web3 instance and connect to a local blockchain
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  // Initialize the contract
  initContract: function() {
    $.getJSON('Election.json', function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect the provider to interact with the contract
      App.contracts.Election.setProvider(App.web3Provider);
      // Render the UI
      return App.render();
    });
  },

 // Render the content of the application
  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return Promise.all([
        electionInstance.candidatesCount(),
        electionInstance.votingEndTime()
      ]);
    }).then(function(results) {
      var candidatesCount = results[0];
      var votingEndTime = results[1].toNumber(); // Convert BigNumber to JavaScript number

      var candidatesResults = $("#candidatesResults");
      var candidateSelect = $("#candidateSelect");

      candidatesResults.empty();
      candidateSelect.empty();

      // Render each candidate
      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0].toNumber();
          var name = candidate[1];
          var voteCount = candidate[2].toNumber();

          // Create a row template for each candidate
          var candidateTemplate = `<tr><th>${id}</th><td>${name}</td><td>${voteCount}</td></tr>`;
          candidatesResults.append(candidateTemplate);

          // Create an option for each candidate
          var candidateOption = `<option value="${id}">${name}</option>`;
          candidateSelect.append(candidateOption);
        }).catch(function(error) {
          console.warn(error);
        });
      }

      // Calculate remaining time
      var now = Math.floor(Date.now() / 1000); // Current time in seconds
      var remainingTime = votingEndTime - now;
      if (remainingTime > 0) {
        var minutes = Math.floor(remainingTime / 60);
        var seconds = remainingTime % 60;
        $("#votingTime").html(`Voting ends in: ${minutes} minutes and ${seconds} seconds`);
        $('#voteForm').show(); // Show the vote form if voting is active
      } else {
        $('#voteForm').hide(); // Hide the vote form if voting period has ended
        $('#votingTime').html('Voting period has ended.');
      }

      loader.hide();
      content.show();

      // Check if the voting period is still active
      if (remainingTime > 0) {
        App.checkVotingPeriod(electionInstance);
      }
    }).catch(function(error) {
      console.error(error);
      loader.hide();
      content.show();
    });
  },

  // Check if the voting period is active
  checkVotingPeriod: function(instance) {
    instance.votingEndTime().then(function(endTime) {
      var now = Math.floor(Date.now() / 1000); // Current time in seconds
      if (now < endTime.toNumber()) {
        // Voting period is active
        $('#voteForm').show();
      } else {
        // Voting period has ended
        $('#voteForm').hide();
        $('#content').html('<p>Voting period has ended.</p>');
      }
    }).catch(function(error) {
      console.error(error);
    });
  },

  // Cast a vote
  castVote: function() {
    var candidateId = $('#candidateSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $('#content').hide();
      $('#loader').show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

// Initialize the application when the window loads
$(function() {
  $(window).on('load', function() {
    App.init();
  });

  // Handle the form submission
  $('#voteForm').on('submit', function(event) {
    event.preventDefault();
    App.castVote();
  });
});
