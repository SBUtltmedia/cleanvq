<?

function saveUserData($body){
  $netID = $_SERVER['cn'];
  $data = $_POST['userData'];
  $userDataFile= "../../users/".$_POST['vqBase']."data/" . $netID;
  print(file_put_contents($userDataFile, $data));
}
?>
