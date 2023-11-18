pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

include "lib/merkleproofposeidon.circom";
include "utxo.circom";

template Transaction(tree_height, n_ins, n_outs, expected_value) {

    signal input root;
    signal input subtree_root;
    signal input nullifier[n_ins];
    signal input utxo_out_hash[n_outs];
    signal input token;
    signal input delta;
    signal input message_hash;

    signal input mp_sibling[n_ins][tree_height]; 
    signal input mp_path[n_ins]; 
    signal input subtree_mp_sibling[n_ins][tree_height];
    signal input utxo_in_data[n_ins][2];
    signal input utxo_out_data[n_outs][2];
    signal input secret;
    signal input secret_token;

    var sum_ins = 0;
    var sum_outs = 0;

    component mp[n_ins];
    component mp_path_bits[n_ins];
    component subtree_mp[n_ins];

    // loop to add merkle path proofs to merkleproofposeidon subcircuit
    for(var i=0; i<n_ins; i++) {
        mp_path_bits[i] = Num2Bits(tree_height);
        mp_path_bits[i].in <== mp_path[i];

        mp[i] = merkleproofposeidon(tree_height);
        subtree_mp[i] = merkleproofposeidon(tree_height);
        for(var j=0; j<tree_height; j++) {
            mp[i].sibling[j] <== mp_sibling[i][j];
            mp[i].path[j] <== mp_path_bits[i].out[j];

            subtree_mp[i].sibling[j] <== subtree_mp_sibling[i][j];
            subtree_mp[i].path[j] <== mp_path_bits[i].out[j];
        }
    }

    // verifies in commitments
    component pubkey = Pubkey();
    pubkey.in <== secret;

    component utxo_in[n_ins];
    component utxo_in_invalid[n_ins];
    component utxo_in_commit[n_ins];
    component utxo_in_nullifier[n_ins];

    for(var i=0; i<n_ins; i++) {
        utxo_in[i] = UTXO_hasher();
        utxo_in_commit[i] = Owner_commit();
        utxo_in_commit[i].pubkey <== pubkey.out;
        utxo_in_commit[i].blinding <== utxo_in_data[i][1];
        utxo_in[i].token <== secret_token;
        utxo_in[i].amount <== utxo_in_data[i][0];
        utxo_in[i].owner_commit <== utxo_in_commit[i].out;

        sum_ins += utxo_in[i].amount; 

        mp[i].leaf <== utxo_in[i].out;
        subtree_mp[i].leaf <== expected_value;
        // checkts that either proof is correct for UTXO
        // or UTXO's value is 0
        (mp[i].root - root) * utxo_in[i].amount === 0;
        (subtree_mp[i].root - subtree_root) * utxo_in[i].amount === 0;

        utxo_in_invalid[i] = Num2Bits(240);
        utxo_in_invalid[i].in <== utxo_in[i].amount;

        utxo_in_nullifier[i] = Nullifier();
        utxo_in_nullifier[i].secret <== secret;
        utxo_in_nullifier[i].utxo_hash <== utxo_in[i].out;
        utxo_in_nullifier[i].out === nullifier[i];
    }

    // verifies out commitments
    component utxo_out[n_outs];
    component utxo_out_invalid[n_outs];
    for(var i=0; i<n_outs; i++) {
        utxo_out[i] = UTXO_hasher();
        utxo_out[i].token <== secret_token;
        utxo_out[i].amount <== utxo_out_data[i][0];
        utxo_out[i].owner_commit <== utxo_out_data[i][1];
        utxo_out[i].out === utxo_out_hash[i];

        utxo_out_invalid[i] = Num2Bits(240);
        utxo_out_invalid[i].in <== utxo_out[i].amount;

        sum_outs += utxo_out[i].amount; 
    }

    // verify that message hash does not overflow
    component message_hash_invalid = IsZero();
    message_hash_invalid.in <== message_hash + 1;
    message_hash_invalid.out === 0;

    // verify that no equal nullifiers are being used
    component sameNullifiers[n_ins * (n_ins - 1) / 2];
    var index = 0;
    for (var i = 0; i < n_ins - 1; i++) {
      for (var j = i + 1; j < n_ins; j++) {
          sameNullifiers[index] = IsZero();
          sameNullifiers[index].in <== nullifier[i] - nullifier[j];
          sameNullifiers[index].out === 0;
          index++;
      }
    }

    // verify that delta amount matches sum of UTXO inputs (+) and outputs (-)
    sum_ins + delta === sum_outs;

    // asserts that either transaction is totally internal
    // (in which case user does not need to reveal token)
    // or that revealed token is equal to private sgnal secret_token 
    (secret_token - token) * delta === 0;
}

component main {
    public [
        root,
        subtree_root,
        nullifier,
        utxo_out_hash,
        token,
        delta,
        message_hash
    ]
} = Transaction(
    <%= tree_height %>,
    <%= n_ins %>,
    <%= n_outs %>,
    <%= expected_value %>
);
