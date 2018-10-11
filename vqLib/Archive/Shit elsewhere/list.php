<?
include("codelink.php");
session_start();
$_SESSION['affiliation']=$_SERVER['affiliation']; 
$count=1;
foreach($_SERVER as $key => $value) {
echo $count++.' - $_SERVER[\''.$key.'\'] --- '. $value . '<br>';
}
?>