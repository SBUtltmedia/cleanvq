<?
function saveFolderData($body){
  $netID = $_SERVER['cn'];
  $data = $_POST['data'];
  $path = "../../users/" . $netID . "/folders.json";
  file_put_contents(injectUserPath($path), $data);
  print_r(file_get_contents(injectUserPath($path)));
}
?>
