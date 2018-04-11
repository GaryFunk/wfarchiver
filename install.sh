#!/bin/bash
#wget -qO - http://wf.fsoft.com/wfarchiver/install.sh | bash -e
#V1.0.0
SUDO=''
if [ $EUID != 0 ]; then
    SUDO='sudo'
fi

echo "######################################################"
echo "Staring WFArchiver Install ..."
echo ""
echo "Updating System files ..."
echo "========================================"
$SUDO apt-get -qy update
echo ""
echo "Upgrading System files ..."
echo "========================================"
$SUDO apt-get -qy dist-upgrade
echo ""
echo "Changing to WFArchiver directory ..."
echo "========================================"
[ ! -d ~/wfarchiver ] && mkdir ~/wfarchiver
cd ~/wfarchiver
echo ""
echo "Checking for Node.js ..."
echo "========================================"
nodeVer=$(node -v)
if [ "$nodeVer" = "" ]; then
  echo ""
  echo "Installing Nodejs"
  echo "========================================"
  $curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
  $SUDO apt-get install -qy nodejs
  node -v
  echo ""
  echo "Installing Forever for Nodejs"
  echo "========================================"
  $SUDO npm install forever -g
  echo "Complete ..."
else
  echo "Node.js version is $nodeVer" 
  echo ""
  echo "Installing Forever for Nodejs"
  echo "========================================"
  $SUDO npm install forever -g
  echo "Complete ..."
fi
echo ""
echo "Copying files"
echo "========================================"
$SUDO wget -Nq http://wf.fsoft.com/wfarchiver/create-database-tables.js
$SUDO wget -Nq http://wf.fsoft.com/wfarchiver/air-daily-stats.js
$SUDO wget -Nq http://wf.fsoft.com/wfarchiver/sky-daily-stats.js
$SUDO wget -Nq http://wf.fsoft.com/wfarchiver/archive.js
$SUDO wget -Nq http://wf.fsoft.com/wfarchiver/forever.json
$SUDO wget -Nq http://wf.fsoft.com/wfarchiver/package.json
echo "Complete ..."
echo ""
echo "Installing required node modules ..."
echo "========================================"
$SUDO npm install
echo "Complete ..."
echo ""
echo "Creating database and tables ..."
echo "========================================"
$SUDO node create-database-tables.js
echo "Complete ..."
echo ""
echo "######################################################"
echo "DONE! "
echo "######################################################"
