<?php
if (isset($_POST['mapdata']) && isset($_POST['filename']))
{
	$json_data = $_POST['mapdata'];
	$filename = $_POST['filename'];

	if (file_put_contents('./data/maps/'.$filename.'.JSON', $json_data) != false) {
		$message = "Successful saving!";
		// file_put_contents('log.txt', date('Y-m-d H:i:s') ." ". $message ." \r", FILE_APPEND);
		echo $message;
	} else {
		$message = "Save failed!";
		// file_put_contents('log.txt', date('Y-m-d H:i:s') ." ". $message ." \r", FILE_APPEND);
		echo $message;
	}
}
else
{
	// file_put_contents('log.txt', date('Y-m-d H:i:s') . 'MAPDATA is empty! \r', FILE_APPEND);
}
