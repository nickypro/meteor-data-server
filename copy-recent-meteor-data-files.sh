#!/bin/bash
files=$1
output=$2
MAXDAYS=2

while getopts d option
do
case "${option}"
in
d) MAXDAYS=${OPTARG};;
esac
done

if [[ -z $files || -z $output ]];
then 
	echo `date`" - Incorrect Usage"
	echo " - Usage: ./copy-recent-meteor-data-files.sh /input/path(s*)/ /output/folder/"
	echo " - Example: ./copy-recent-meteor-data-files.sh \"/mnt/backup1/sam/\" \"/mnt/massive-stars/meteors-data.ap.dias.ie/DataFiles\""
	echo " - ENSURE that if using wildcard /*/ that the input is wrapped in quotation marks"
	exit 1
fi;

echo "reading from $files"
echo "exporting to $output"

#files=/mnt/backup1/sam/AllSky/IE0002*/
#output=/mnt/massive-stars/meteors-data.ap.dias.ie/Dunsink
TEMPFILE=$(mktemp /tmp/recent_txt_files.XXXXXXXX.txt)
chmod 777 $TEMPFILE

find $files -mtime -$MAXDAYS -name "*.txt" -ls > $TEMPFILE

stat $TEMPFILE

for file in `cat $TEMPFILE | awk '{print $11}' `;
do
	filename=$(basename -- "$file")
	filedir=$(dirname "$file")
	foldername=${filedir##*/}
	FILEYEAR="${foldername:7:4}"
	FILEMONTH="${foldername:11:2}"
	FILEDAY="${foldername:13:2}"
	folder="$output/$FILEYEAR/$FILEMONTH/$FILEDAY"
			
	expectedoutput="$folder/$filename"

	# If there is a file there then continue
	if test -f "$expectedoutput"; then
    echo "$expectedoutput exists."
    continue
	
	else
		mkdir -p "$folder"
		cp "$file" "$folder"
    echo $expectedoutput
	fi

done

rm $TEMPFILE 