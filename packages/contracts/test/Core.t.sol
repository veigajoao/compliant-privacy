// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/Core.sol";
import "../src/Groth16Verifier.sol";

contract OpactTest is Test {
    Core core;
    Groth16Verifier verifier;
    IERC20 token;

    address admin;
    address tokenInstance;
    address recipient;
    address walletWithTokens;

    function setUp() public {
        verifier = new Groth16Verifier();
        core = new Core(address(verifier));
        admin = address(this);
        recipient = address(this);
        tokenInstance = 0xcf185f2F3Fe19D82bFdcee59E3330FD7ba5f27ce; // KTK on Sepolia, faucet: https://www.erc20tokenfaucet.com/
        walletWithTokens = 0x0BA0076b4015Bf9328212e738aDf78F64CA3D799; // Wallet with tokens KTK on Sepolia
    }

    function testTransact() public {
        vm.startPrank(walletWithTokens);

        console.log("Last root: ");
        console.logBytes32(core.getLastRoot());

        Core.CoreProof memory proof;
        Core.ExtData memory extData;

        extData.tokenAmount = 1000000000000000000;

        token = IERC20(tokenInstance);
        token.approve(address(core), uint256(extData.tokenAmount));

        proof.publicValues = new uint[](10);
        proof.publicValues[0] = 0x28a650ee794f9a8c954420b722c8fc9ae0c81b296557dbbb4d1cda98737cd726;
        proof.publicValues[1] = 0x2f68a1c58e257e42a17a6c61dff5551ed560b9922ab119d5ac8e184c9734ead9;
        proof.publicValues[2] = 0x1ff287d6b12f07cf69975c7222abaa99af98399a404cd357ac561c845734329b;
        proof.publicValues[3] = 0x09c848b5ba23158b3bc396879d392934b4995173d3ca87e0048ec7970235290b;
        proof.publicValues[4] = 0x27be07855304bdaeea82b4b4ed32e25999b6eab1d171ab355f53365ba260e27c;
        proof.publicValues[5] = 0x2603d7613bb16189a5f2f837d5a7ed3b935a4e3fab941c7c09e77933ebe2754e;
        proof.publicValues[6] = 0x074d61f8c5a1816c8dd1347e87629fd391b3fdade9d36cdea946264cc14f377f;
        proof.publicValues[7] = 0x0734ac2afb931dc09827466a595770e73b598af17892a1bb3cd3fee0d525cde8;
        proof.publicValues[8] = 0x0000000000000000000000000000000000000000000000000de0b6b3a7640000;
        proof.publicValues[9] = 0x29176100eaa962bdc1fe6c654d6a3c130e96a4d1168b33848b897dc502820133;

        proof.a.x = 0x13df2b9621370bd16bff2a44a9d48b4006848190b388bb61c511b30cdbff0175;
        proof.a.y = 0x2c25dd6efd368439d08e4b95989738de559df172455e88cd3a90ed05089e2975;

        proof.b.x[0] = 0x25d2241d692f51f416b3247ed2d27345faa53cf70b57895f83f6c494efa0656b;
        proof.b.x[1] = 0x16ac6f57bc624bac451f0844f234e59a51f2518f6da5dafc1ef5727ed9a61443;

        proof.b.y[0] = 0x16f54169351864fcf30db102535d8ac9b033dba69b8e186d0599d29e79b87d6c;
        proof.b.y[1] = 0x205718d220e3a89525b7fa1ca4e70e475fc33b940921709155134c55ddb4748a;

        proof.c.x = 0x2931131ee4bd1886eeacd978e29fe660027ce0aca809531ccaaaab91292ac86e;
        proof.c.y = 0x3040a87cc5b115acf5ce706a78237e8ab14f1fd73024525c0da96d85858b3322;

        extData.recipient = recipient;
        extData.tokenAddress = tokenInstance;
        extData.encryptedReceipts = new string[](2);
        extData.encryptedReceipts[0] = "encryptedReceipt";
        extData.encryptedReceipts[1] = "encryptedReceipt";
        extData.encryptedCommitments = new string[](2);
        extData.encryptedCommitments[0] = "encryptedCommitment";
        extData.encryptedCommitments[1] = "encryptedCommitment";
        extData.outputCommitments = new uint256[](2);
        extData.outputCommitments[0] = 1;
        extData.outputCommitments[1] = 2;

        bool result = core.transact(proof, extData);

        vm.stopPrank();

        assertTrue(result);
    }
}
