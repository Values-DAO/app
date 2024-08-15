// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import { IEAS, Attestation } from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";

contract Resolver is SchemaResolver {
    address private _targetAttester;
    bool private _access;

    constructor(IEAS eas, address targetAttester) SchemaResolver(eas) {
        _targetAttester = targetAttester;
    }

    function changeAttester(address targetAttester) public {
        require(
            msg.sender == _targetAttester,
            "Only the previous attester can change the new attester."
        );
        _targetAttester = targetAttester;
    }

    function setAccess(bool access) public {
        require(
            msg.sender == _targetAttester,
            "Only the previous attester can change the access value."
        );
        _access = access;
    }

    function onAttest(Attestation calldata attestation, uint256 /*value*/) internal view override returns (bool) {
        if (_access == true) {
            return true;
        } else {
            return attestation.attester == _targetAttester;
        }
    }

    function onRevoke(Attestation calldata /*attestation*/, uint256 /*value*/) internal pure override returns (bool) {
        return true;
    }
}