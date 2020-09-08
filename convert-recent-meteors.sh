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
	echo " - Usage: ./convert-recent-meteors.sh \"/INPUT/FOLDER(S*)/\" /OUTPUT/FOLDER/"
	echo " - Example: ./convert-recent-meteors.sh \"/mnt/backup1/sam/AllSky/IE0002*/\" \"/mnt/massive-stars/meteors-data.ap.dias.ie/Dunsink\""
	echo " - ENSURE that if using wildcard /*/ that the input is wrapped in quotation marks"
	echo " - can also add a flag for -d MAXDAYS"
	exit 1
fi;

echo "reading from $files"
echo "exporting to $output"

#files=/mnt/backup1/sam/AllSky/IE0002*/
#output=/mnt/massive-stars/meteors-data.ap.dias.ie/Dunsink
TEMPFILE=$(mktemp /tmp/recent_fits_files.XXXXXXXX.txt)
chmod 777 $TEMPFILE 

find $files -mtime -$MAXDAYS -name "*.fits" -ls > $TEMPFILE

stat $TEMPFILE

for file in `cat $TEMPFILE | awk '{print $11}' `;
do
     	filename=$(basename -- "$file")
	filedir=$(dirname "$file")
        foldername=${filedir##*/}
	FILEYEAR="${foldername:7:4}"
	FILEMONTH="${foldername:11:2}"
   	FILEDAY="${foldername:13:2}"
        folder="$output/$FILEYEAR/$FILEMONTH/$FILEYEAR$FILEMONTH$FILEDAY"
        expectedoutput="$folder/${filename%.*}.png"

	# if folder does not exist,then process all 
	if [ ! -d "$folder" ]; then
	
		echo "Creating and populating folder $folder"

        	mkdir -p "$folder"
		    	tempdir=$(mktemp -d /tmp/fits2png-XXXXXXXX)

		cp $filedir/*.fits "$tempdir"
	
		python -m Utils.BatchFFtoImage "$tempdir" png

        	mv $tempdir/*.png "$folder"
	
		echo " - Saving to $folder"

 		rm -R $tempdir

		continue

	# If there is a file there then continue
	elif test -f "$expectedoutput"; then
    	    	echo "$expectedoutput exists."
            	continue
	else
		mkdir -p "$folder"


		tempdir=$(mktemp -d /tmp/fits2png-XXXXXXXX)
		
		cp "$file" "$tempdir/"

        	python -m Utils.BatchFFtoImage "$tempdir" png

        	mv $tempdir/*.png "$folder"
	
		echo " - Saving to $folder"

        	rm -R "$tempdir"

	fi

done

rm $TEMPFILE