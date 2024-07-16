pragma solidity ^0.5.0;

contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;

    // Read/write candidates
    mapping(uint => Candidate) public candidates;

    // Store Candidates Count
    uint public candidatesCount;

    // Voting period
    uint public votingStartTime;
    uint public votingEndTime;

    // Voted event
    event votedEvent (
        uint indexed _candidateId
    );

    // Constructor
    constructor(uint _votingDuration) public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
        votingStartTime = now;
        votingEndTime = now + _votingDuration;
    }

    // Function to add candidate
    function addCandidate(string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    // Function to vote
    function vote(uint _candidateId) public {
        // Require that the voting period is active
        require(now >= votingStartTime && now <= votingEndTime, "Voting period is not active");

        // Require that they haven't voted before
        require(!voters[msg.sender], "You have already voted");

        // Require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");

        // Record that voter has voted
        voters[msg.sender] = true;

        // Update candidate vote count
        candidates[_candidateId].voteCount ++;

        // Trigger voted event
        emit votedEvent(_candidateId);
    }
}
