#! /usr/bin/env node

var exec = require('child_process').exec,
    temp = require('temporary'),
    rimraf = require('rimraf');

console.log('Attempting to publish docs...');

exec('git config --get remote.origin.url', function(gitConfigErr, gitConfigStdOut, gitConfigStdErr) {
    if (gitConfigErr) {
        console.error('Could not access remote repo URL - ' + gitConfigStdErr);
    }
    else {
        var repoUrlMatcher = /.+[:\/](.+)\/(.+)\.git/.exec(gitConfigStdOut),
            user = repoUrlMatcher[1],
            repo = repoUrlMatcher[2],
            tempDir = new temp.Dir(),
            removeTempDir = function() {
                rimraf(tempDir.path, function(rmdirErr) {
                    if (rmdirErr) {
                        console.warn('Could not delete temporary directory - ' + rmdirErr);
                    }
                });
            };
    
        if (!user || !repo) {
            console.error('Could not determine user and/or repo name for ' + gitConfigStdOut);
        }
    
        process.chdir(tempDir.path);
        
        exec('git clone git://github.com/Polymer/tools.git', function(cloneErr, cloneStdOut, cloneStdErr) {
            if (cloneErr) {
                console.error('Failed to clone Polymer tools repo - ' + cloneStdErr);
                removeTempDir();
            }
            else {
                exec('tools/bin/gp.sh ' + user + " " + repo, function(publishErr, publishStdOut, publishStdErr) {
                    if (publishErr) {
                        console.error('Failed to publish docs - ' + publishStdOut);                
                    }
                    else {
                        console.log('Published updated docs!');
                    }
                    
                    removeTempDir();
                });
            }
        });
    }
});