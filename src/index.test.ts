import { runTests } from "./KnockOnWood"
import { group1, callbacksGroup, postCallbackGroup, group2 } from "./KnockOnWood.test"

runTests({ "Group 1": group1, "Group 2": group2, Callbacks: callbacksGroup, "Post Callbacks": postCallbackGroup })
