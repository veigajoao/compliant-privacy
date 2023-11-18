// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

pragma solidity >=0.7.0 <0.9.0;

contract Groth16Verifier {
    // Scalar field size
    uint256 constant r    = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q   = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax  = 19585229621408861241979089483891340022980560671819105963109956904101022953913;
    uint256 constant alphay  = 17683889819663003197107728572179825117093108995628430167242695730269218995449;
    uint256 constant betax1  = 11815681884459819136775466292413961857142768070519748123365539964381646088673;
    uint256 constant betax2  = 5918189778294398373867215857077657485085144687386129296042139262418695375465;
    uint256 constant betay1  = 17272844284718878797026118469560524097391792914946780395473367380843919101959;
    uint256 constant betay2  = 16256495067915955788372634108963148989989955099312959915110410844897734263002;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 8727638583385609738101795388342351916011223396459855766000146008401890211505;
    uint256 constant deltax2 = 13993602150472858560155233564363942648206880347355668305002642704605480027994;
    uint256 constant deltay1 = 12006431374015058261749200319616940729508728115009771490841997099861635887646;
    uint256 constant deltay2 = 842568382598170465179440031373556574734864213679282612737885930286759656246;

    
    uint256 constant IC0x = 18985717625942302443872900057626571791644290198985915948838866306499375531135;
    uint256 constant IC0y = 18664929259758604989123679134130708242500840834223566961435499812845715275353;
    
    uint256 constant IC1x = 16704765260109124733852408912107132672855923673677169559961893162606970866078;
    uint256 constant IC1y = 20752245957517545323645142434404540424011427060224479409263907983125302163824;
    
    uint256 constant IC2x = 20670739989385879289050206974207798530933734789250139893204871294783520873402;
    uint256 constant IC2y = 12637051470190409883882765099220728661797094715735954158497614667136698344218;
    
    uint256 constant IC3x = 12338494549484790513212728755158722031616367993268843499210307527167013014689;
    uint256 constant IC3y = 17722928670958002151014881781553915372642921915395674605347874209188683260093;
    
    uint256 constant IC4x = 3069317449573908484072509655002255997822387301030476200173018174650009904162;
    uint256 constant IC4y = 3870606306036872582684607676324183363762159323252237913545309003330795357969;
    
    uint256 constant IC5x = 19192467272569051114671988264539967226415741128742782447829182023289205773936;
    uint256 constant IC5y = 2819805564800006569617415166599200330888987208139287576656813042817444430423;
    
    uint256 constant IC6x = 18212845076003536590599326046958739524539878561719589876554602189820877610085;
    uint256 constant IC6y = 8512902847879451947789665499911954187211950261233970183415505696538386099629;
    
    uint256 constant IC7x = 2121652179339306133647430562889660007658650377731564076362345269166194539143;
    uint256 constant IC7y = 2826833947293396510321972108201631449097307901594200025512286228114839250513;
    
    uint256 constant IC8x = 6090439881044258601046438900321076510743533062306341368947297354955895163677;
    uint256 constant IC8y = 4539033419627604110615992362915374462080342149435183392048187129256936129404;
    
    uint256 constant IC9x = 16373483461604914062314871573797562096394601472556096869039931904160734279273;
    uint256 constant IC9y = 1305920940211349646732622266598438976737151099326944723053131879201596652323;
    
    uint256 constant IC10x = 3188540490271636927007515428642750867726392133905279258172226750438498440810;
    uint256 constant IC10y = 3101642708186527315555836355551101132532858145102168288805251842986590588460;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[10] calldata _pubSignals) public view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, q)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }
            
            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x
                
                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))
                
                g1_mulAccC(_pVk, IC2x, IC2y, calldataload(add(pubSignals, 32)))
                
                g1_mulAccC(_pVk, IC3x, IC3y, calldataload(add(pubSignals, 64)))
                
                g1_mulAccC(_pVk, IC4x, IC4y, calldataload(add(pubSignals, 96)))
                
                g1_mulAccC(_pVk, IC5x, IC5y, calldataload(add(pubSignals, 128)))
                
                g1_mulAccC(_pVk, IC6x, IC6y, calldataload(add(pubSignals, 160)))
                
                g1_mulAccC(_pVk, IC7x, IC7y, calldataload(add(pubSignals, 192)))
                
                g1_mulAccC(_pVk, IC8x, IC8y, calldataload(add(pubSignals, 224)))
                
                g1_mulAccC(_pVk, IC9x, IC9y, calldataload(add(pubSignals, 256)))
                
                g1_mulAccC(_pVk, IC10x, IC10y, calldataload(add(pubSignals, 288)))
                

                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))


                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)


                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F
            
            checkField(calldataload(add(_pubSignals, 0)))
            
            checkField(calldataload(add(_pubSignals, 32)))
            
            checkField(calldataload(add(_pubSignals, 64)))
            
            checkField(calldataload(add(_pubSignals, 96)))
            
            checkField(calldataload(add(_pubSignals, 128)))
            
            checkField(calldataload(add(_pubSignals, 160)))
            
            checkField(calldataload(add(_pubSignals, 192)))
            
            checkField(calldataload(add(_pubSignals, 224)))
            
            checkField(calldataload(add(_pubSignals, 256)))
            
            checkField(calldataload(add(_pubSignals, 288)))
            
            checkField(calldataload(add(_pubSignals, 320)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
