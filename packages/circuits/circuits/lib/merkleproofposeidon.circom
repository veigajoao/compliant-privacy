pragma circom 2.0.0;

include "./poseidon.circom";

template merkleproofposeidon(tree_height) {
  signal input sibling[tree_height];
  signal input path[tree_height];
  signal input leaf;
  signal output root;

  component hash[tree_height];

  var node = leaf;

  for(var i = 0; i<tree_height; i++) {
    hash[i] = Poseidon(2);
    hash[i].inputs[0] <== sibling[i] + (node - sibling[i]) * (1 - path[i]);
    hash[i].inputs[1] <== sibling[i] + node - hash[i].inputs[0];
    node = hash[i].out;
  }

  root <== node;
}