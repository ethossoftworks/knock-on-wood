import { runTests } from "./KnockOnWood"
import {
    group1,
    callbacksGroup,
    postCallbackGroup,
    group2,
    alternateConstructorGroup1,
    alternateConstructorGroup2,
} from "./KnockOnWood.test"
;(async () => {
    await runTests({
        "Group 1": group1,
        "Group 2": group2,
        Callbacks: callbacksGroup,
        "Post Callbacks": postCallbackGroup,
    })
    await runTests([alternateConstructorGroup1, alternateConstructorGroup2])
})()
