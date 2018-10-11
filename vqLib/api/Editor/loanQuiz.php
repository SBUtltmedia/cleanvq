<?
function loanQuiz($body){
	$author = $_REQUEST['author'];
	$oldEditor = $_REQUEST['oldEditor'];
	$newEditor = $_REQUEST['newEditor'];
	$scriptPath = realpath(dirname(__FILE__));
	$path="../../users";
	if ($author == $_SERVER['cn'] && $oldEditor != $newEditor) {
		$sourcePath = $_REQUEST['sourcePath'];
		$oldCode = $_REQUEST['oldCode'];
		$newCode = $_REQUEST['newCode'];
		// First, remove the old copy (if it exists)
		if ($oldCode != "" && $oldEditor != "vqEdit") {
			if (file_exists("$path/$oldEditor")) {
				if (file_exists("$path/$oldEditor/$oldCode")) {
					$shell="rm $path/$oldEditor/$oldCode";
					print $shell;
					`$shell`;
				}
			}
		}
		// Next, make the new copy
		if ($newCode != "" && $newEditor != "vqEdit") {
			if (!file_exists("$path/$newEditor")) {
				mkdir("$path/$newEditor");
			}
			$createLink="$scriptPath/../../../vqEdit/createLink.sh $author $newEditor $sourcePath $newCode";
			print $createLink;
			$a= `$createLink`;
			print $a;
		}
	}
}
?>
