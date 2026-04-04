{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{
  packages = [
    pkgs.svelte-language-server
    pkgs.typescript-language-server
    pkgs.biome
  ];
}
