REMOTE=$(git config --get remote.origin.url)
npm run build;
cd build;
git init;
git remote add origin $REMOTE;
git checkout -b gh-pages;
git add -A .;
git commit -m 'publish';
git push origin gh-pages -f;
cd ..;

echo 'Published!'
