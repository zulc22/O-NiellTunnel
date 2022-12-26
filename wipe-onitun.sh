wipe_keep_ignore() {
    mv $1/.gitignore ./_ignore
    rm -rf $1
    mkdir $1
    mv ./_ignore $1/.gitignore
}

docker-compose stop

wipe_keep_ignore sqldata
wipe_keep_ignore dynamic/temp
wipe_keep_ignore dynamic/thumbs
wipe_keep_ignore dynamic/videos