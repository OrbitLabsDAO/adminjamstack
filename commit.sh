ACTION="${1:-github}" # Default to "build" if no parameter is passed
BRANCH="${2:}"


if [ "$ACTION" = "origin" ]; then
    echo "Resetting core files and running integrity check"
    node build_integrity.js

    if [ -n "$BRANCH" ]; then
        echo "Doing branch stuff..."
        git checkout -b "$BRANCH"
        git checkout "$BRANCH"
       
    fi

    #TODO check that the file does not already exist and delete it if it does.
    echo "Moving files to keep them safe"
    # Move entire _source into _site/tmp to preserve structure
    mkdir -p _site/tmp
    mv _source _site/tmp/

    # Move entire _custome into _site/tmp2 to preserve structure
    mkdir -p _site/tmp2
    mv _custom _site/tmp2/

    # Ask user for commit message
    read -p "Enter commit message: " COMMITMESSAGE

    # Git operations
    git checkout "$BRANCH"
    git add .
    git commit -m "$COMMITMESSAGE"
    git push "$ACTION" "$BRANCH"

    # Restore _source from _site/tmp/_source
    mv _site/tmp/_source ./_source
    rmdir _site/tmp 2>/dev/null  # Optional cleanup if empty

    mv _site/tmp2/_custom ./_custom
    rmdir _site/tmp2 2>/dev/null  # Optional cleanup if empty
    echo "Done!"
    exit
fi



if [ "$ACTION" = "github" ]; then

    # Ask for commit message
    read -p "Enter commit messages: " COMMITMESSAGE
    echo "Doing the all the git things"
    # Git operations
    git checkout "$BRANCH"
    git add .
    git commit -a -m "$COMMITMESSAGE"
    git push "$ACTION" "$BRANCH"
    echo "Done!"
    exit
fi

echo "Unknown remote $ACTION"