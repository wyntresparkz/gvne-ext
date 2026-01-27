1. loading chats will fail at random with no console errors - no known cause or steps to reproduce faithfully
        -STEPS TO REPRODUCE
            -simply load chats - eventually the SPA redirection will fail to change url to new chat
    -THOUGHTS ON CAUSE
        -no idea currently
        -Update after 1.0.1.6
            -turns out focusing on something else helped me to imagine the issue in a new light
            -issue appears to be caused by save games being re-ordered 
            -say you load the chat in slot 3 - after loading slot 3 is moved to slot 1 - selecting the save in slot 3 will attempt to reload the same chat that is currently opened rather than the one displayed - almost like the positions are cached in a way.
                            --SOLVED--

2. location data will fail to update upon subsequent changes
        -STEPS TO REPRODUCE
            -start with a nameless persona that is properly using [{location}] tag
            -location and name will read and save properly
            -once the persona changes nametag to anything else location tag gets dropped from buffered variable
        -THOUGHTS ON CAUSE
            -possible that script for grabbing name and location for save name generation clears entry and reads that unchanged values need not be copied? uncertain
                -detection systems have not been touched since this issue appeared however issue appears to have been resolved
                -Leaving issue open until confirmation of absence.
                            --UNCERTAIN--

3. (low priority) Namebar is not "connected"
        -steps to reporoduce
            -speak with named persona properly using nametags
                ![alt text](image.png)
        -THOUGHTS ON CAUSE
            -hard coded pixel values instead of relative anchoring.

4. (low priority) Namebar displayed overtop of dialogue box when appearing/disappearing
        -STEPS TO REPRODUCE
            -Speak with named persona that is properly using nametags
        -THOUGHTS ON CAUSE
            -namebar on higher zindex than dialogue box

5. (low priority) Name is not centered within namebar
        -STEPS TO REPRODUCE
            -Speak with named persona that is properly using nametags
        -THOUGHTS ON CAUSE
            -improperly formatted text centering
