#!/bin/bash
files=$1
output=$2
MAXDAYS=2

if [[ -z $files || -z $output ]];
then 
	echo `date`" - Incorrect Usage"
	echo " - Usage: ./convert-recent-meteors.sh /PATH/TO/INPUTFOLDER(S*)/ /PATH/TO/OUTPUT/FOLDER/"
	echo " - Example: ./convert-recent-meteors.sh \"/mnt/backup1/sam/AllSky/IE0002*/\" \"/mnt/massive-stars/meteors-data.ap.dias.ie/Dunsink\""
	echo " - ENSURE that if using wildcard /*/ that the input is wrapped in quotation marks"
	exit 1
fi;

echo "reading from $files"
echo "exporting to $output"

#files=/mnt/backup1/sam/AllSky/IE0002*/
#output=/mnt/massive-stars/meteors-data.ap.dias.ie/Dunsink

rm /tmp/recent_fits_files.txt

find $files -mtime -$MAXDAYS -name "*.fits" -ls > /tmp/recent_fits_files.txt

stat /tmp/recent_fits_files.txt

for file in `cat /tmp/recent_fits_files.txt | awk '{print $11}' `;
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
		tempdir="/tmp/fits2png"
        	mkdir -p "$tempdir"

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

		mkdir -p /tmp/meteor-fits-2-png/

		cp "$file" "/tmp/meteor-fits-2-png/"

        	python -m Utils.BatchFFtoImage "/tmp/meteor-fits-2-png/" png

        	mv /tmp/meteor-fits-2-png/*.png "$folder"
	
		echo " - Saving to $folder"

        	rm -R "/tmp/meteor-fits-2-png"

	fi

        #mv $file/*.png ${file:46:8}
done
