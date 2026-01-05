// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.20;

/**
 * @title BridgeLog
 * @notice BRIDGE 2026의 감사 가능성을 위한 온체인 앵커링 컨트랙트
 * 
 * 이 컨트랙트는 모든 원본 데이터를 온체인에 저장하는 것이 아니라,
 * 해시와 CID를 저장하여 감사 가능성(auditability)만 확보합니다.
 */
contract BridgeLog {
    // 일일 신호 머클루트
    mapping(uint256 => bytes32) public dailySignalsRoot;
    
    // Decision Packet CID
    mapping(string => string) public decisionPacketCID; // issueId => IPFS/Arweave CID
    
    // Outcome Proof CID
    mapping(string => string) public outcomeProofCID; // proposalId => IPFS/Arweave CID
    
    // 이벤트
    event SignalsRootAnchored(uint256 indexed date, bytes32 root);
    event DecisionPacketAnchored(string indexed issueId, string cid);
    event OutcomeProofAnchored(string indexed proposalId, string cid);
    
    // 관리자 (초기에는 배포자, 이후 멀티시그로 전환)
    address public admin;
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "BridgeLog: caller is not admin");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @notice 일일 신호 머클루트를 앵커링합니다.
     * @param date 날짜 (Unix timestamp / 86400)
     * @param root 머클루트 해시
     */
    function anchorSignalsRoot(uint256 date, bytes32 root) external onlyAdmin {
        dailySignalsRoot[date] = root;
        emit SignalsRootAnchored(date, root);
    }
    
    /**
     * @notice Decision Packet CID를 앵커링합니다.
     * @param issueId 이슈 ID
     * @param cid IPFS/Arweave CID
     */
    function anchorDecisionPacket(string calldata issueId, string calldata cid) external onlyAdmin {
        decisionPacketCID[issueId] = cid;
        emit DecisionPacketAnchored(issueId, cid);
    }
    
    /**
     * @notice Outcome Proof CID를 앵커링합니다.
     * @param proposalId 제안 ID
     * @param cid IPFS/Arweave CID
     */
    function anchorOutcomeProof(string calldata proposalId, string calldata cid) external onlyAdmin {
        outcomeProofCID[proposalId] = cid;
        emit OutcomeProofAnchored(proposalId, cid);
    }
    
    /**
     * @notice 관리자를 변경합니다 (멀티시그로 전환 가능).
     * @param newAdmin 새로운 관리자 주소
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "BridgeLog: invalid admin address");
        admin = newAdmin;
    }
}









