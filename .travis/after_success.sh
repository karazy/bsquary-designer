git config --global user.email $OPENSHIFT_EMAIL
git config --global user.name $OPENSHIFT_NAME
echo "Deploying to openshift"
echo "Host designer-bsquary.rhcloud.com" >> ~/.ssh/config
echo "   StrictHostKeyChecking no" >> ~/.ssh/config
echo "   CheckHostIP no" >> ~/.ssh/config; 
echo "   UserKnownHostsFile=/dev/null" >> ~/.ssh/config;

if [[ $TRAVIS_PULL_REQUEST == "false" && $TRAVIS_BRANCH == "master" ]]
  then 
    ssh-keygen -t rsa -f ~/.ssh/id_rsa -q -N "" -n "Travis_Openshift"
  	echo "Install rhc"
  	gem install rhc 
  	echo "rhc setup"
  	echo yes | rhc setup --server openshift.redhat.com -l $OPENSHIFT_EMAIL -p $OPENSHIFT_PW --create-token --insecure --ssl-client-key-file ~./ssh/id_rsa
    echo "Setup and configure dist folder"
  	mkdir -p dist/openshift/markers/
  	touch dist/openshift/markers/hot_deploy 

  	echo "Adding "$OPENSHIFT_REPO" as git repo" 	
  	cd dist/
  	git init
  	git remote add openshift $OPENSHIFT_REPO
  	cd ..

  	echo "Grunt build"
  	grunt build
  	echo "Grunt buildcontrol:openshift"
  	echo yes | grunt buildcontrol:openshift

fi
if [[ $TRAVIS_PULL_REQUEST == "false" ]]
  then
    echo $TRAVIS_BRANCH
fi
echo
echo "...done."