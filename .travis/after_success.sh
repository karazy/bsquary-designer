git config --global user.email $OPENSHIFT_EMAIL
git config --global user.name $OPENSHIFT_NAME
echo "Deploying to openshift"
if [[ $TRAVIS_PULL_REQUEST == "false" && $TRAVIS_BRANCH == "master" ]]
  then 
  	echo "Install rhc"
  	gem install rhc 
  	echo "rhc setup"
  	rhc setup --server openshift.redhat.com -l $OPENSHIFT_EMAIL -p $OPENSHIFT_PW --no-create-token --noprompt --insecure
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
  	grunt buildcontrol:openshift

fi
if [[ $TRAVIS_PULL_REQUEST == "false" ]]
  then
    echo $TRAVIS_BRANCH
fi
echo
echo "...done."