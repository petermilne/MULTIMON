MULTIMON: large scale UUT monitor.

A single python file multimon400.py runs continuously, monitoring EPICS beacons
multimon400.py maintains an xml state file
 * multimon_acq400.xml

This file is written once a second to a directory under httpd:

/var/www/html/multimon

Web clients connect to 
http://host/multimon/ where index.html runs a small javascript that fetches the .xml file and transforms it to a web page using an xslt style sheet.

The style sheet may be easily styled to local requirements.

We recommend that /var/www/html/multimon is a ramdisk mount to avoid wear on the main system disk

This is initiated on boot using:
start.multimon.ramdisk



