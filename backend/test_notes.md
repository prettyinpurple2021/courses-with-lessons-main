Test failure analysis notes:
- courseService.test.ts line 207 failure: achievementService.checkAndUnlockAchievements not called.
- Need to verify if courseService.ts actually calls it.
- Need to randomize courseNumber in tests.
